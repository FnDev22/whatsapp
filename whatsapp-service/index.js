import 'dotenv/config';
import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';
import pino from 'pino';
import http from 'http';
import QRCode from 'qrcode';
import fs from 'fs';
import os from 'os';

// ============================================================
// 🔧 KONFIGURASI ENVIRONMENT
// ============================================================
// Mendukung nama variabel dari Vercel, Hugging Face, dan Railway
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PORT = process.env.PORT || 8000;
const AUTH_FOLDER = 'auth_info_baileys';
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '6285814581266';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: SUPABASE_URL & SUPABASE_KEY wajib diisi di environment variables!');
    // Jangan exit dulu agar server tetap jalan dan user bisa benerin settings
}

// ============================================================
// 📦 INISIALISASI SUPABASE & SERVER
// ============================================================
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

let currentQRCode = null;
let currentPairingCode = null;

const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: isConnected ? 'connected' : 'disconnected',
            uptime: Math.round(process.uptime()),
            supabase: !!supabase,
            hasQR: !!currentQRCode,
            hasPairingCode: !!currentPairingCode
        }));
    } else if (req.url === '/qr') {
        // Return QR code sebagai PNG image
        if (currentQRCode) {
            try {
                res.writeHead(200, { 'Content-Type': 'image/png' });
                QRCode.toBuffer(currentQRCode, {
                    errorCorrectionLevel: 'H',
                    type: 'image/png',
                    quality: 0.95,
                    margin: 2,
                    width: 500,
                }, (err, buffer) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error generating QR');
                    } else {
                        res.end(buffer);
                    }
                });
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to generate QR' }));
            }
        } else {
            res.writeHead(202, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'waiting',
                message: 'QR Code belum tersedia. Tunggu beberapa detik...'
            }));
        }
    } else if (req.url === '/pairing-code') {
        // Return pairing code
        if (currentPairingCode) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                pairingCode: currentPairingCode,
                message: 'Masukkan code ini di WhatsApp untuk pairing'
            }));
        } else {
            res.writeHead(202, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'waiting',
                message: 'Pairing code belum tersedia. Tunggu beberapa detik...'
            }));
        }
    } else if (req.url === '/info') {
        // Return bot info
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            name: 'F-PEDIA WhatsApp Service',
            version: '1.0.0',
            status: isConnected ? 'connected' : 'disconnected',
            endpoints: {
                health: '/health',
                qr: '/qr (PNG image)',
                pairingCode: '/pairing-code (JSON)',
                info: '/info'
            },
            uptime: Math.round(process.uptime()),
            platform: process.platform,
            nodeVersion: process.version
        }));
    } else {
        res.writeHead(200);
        res.end('F-PEDIA WhatsApp Service is Running. Visit /info for endpoints');
    }
});

server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server di port ${PORT}`));

// ============================================================
// 🛡️ GRACEFUL SHUTDOWN & PROCESS HANDLERS
// ============================================================
process.on('SIGINT', () => {
    console.log('\n⏹️ Menerima SIGINT, menutup aplikasi...');
    if (sock) {
        sock.end();
    }
    if (global.queueInterval) {
        clearInterval(global.queueInterval);
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n⏹️ Menerima SIGTERM, menutup aplikasi...');
    if (sock) {
        sock.end();
    }
    if (global.queueInterval) {
        clearInterval(global.queueInterval);
    }
    process.exit(0);
});

// Log startup info
console.log('======================================================');
console.log('🤖 F-PEDIA WhatsApp Service - Startup');
console.log('======================================================');
console.log(`Node Version: ${process.version}`);
console.log(`Process ID: ${process.pid}`);
console.log(`Platform: ${process.platform}`);
console.log(`Memory Available: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`);
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️ WARNING: Supabase credentials belum dikonfigurasi!');
} else {
    console.log('✅ Supabase credentials sudah dikonfigurasi');
}
console.log('======================================================\n');

// ============================================================
// 📱 FUNGSI UTAMA WHATSAPP
// ============================================================
let sock = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

async function startWhatsApp() {
    console.log('⏳ Memulai koneksi WhatsApp...');

    // Ensure auth folder exists
    if (!fs.existsSync(AUTH_FOLDER)) {
        console.log(`📁 Membuat folder ${AUTH_FOLDER}...`);
        fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    // Longer initial delay untuk Hugging Face containers
    const initialDelay = 5000;
    console.log(`⏰ Menunggu ${initialDelay / 1000} detik untuk memastikan network siap...`);
    await new Promise(resolve => setTimeout(resolve, initialDelay));

    try {
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`🔄 Menggunakan WA versi: v${version.join('.')} (Latest: ${isLatest})`);

        const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

        sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: state,
            browser: ['Ubuntu', 'Chrome', '20.0.4'], // Standard browser info
            syncFullHistory: false,
            generateHighQualityLinkPreview: true,
            connectTimeoutMs: 60000, // Tambah timeout koneksi
            defaultQueryTimeoutMs: 0,
            retryRequestDelayMs: 5000,
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr, pairingCode } = update;

            // Capture QR code
            if (qr) {
                currentQRCode = qr;
                console.log('\n======================================================');
                console.log('⚡ SCAN QR CODE ⚡');
                console.log('======================================================');
                console.log('📱 Method 1: Scan via web');
                console.log(`🔗 Open: http://localhost:${PORT}/qr`);
                console.log('');
                try {
                    console.log(await QRCode.toString(qr, { type: 'terminal', small: true }));
                } catch (err) {
                    console.log('⚠️ Gagal generate QR string');
                }
                console.log('======================================================\n');
            }

            // Capture pairing code (Baileys v7+ feature)
            if (pairingCode) {
                currentPairingCode = pairingCode;
                console.log('\n💬 PAIRING CODE (Alternative Method):');
                console.log(`📌 Code: ${pairingCode}`);
                console.log('👉 Buka WhatsApp → Settings → Linked Devices → Link Device');
                console.log('👉 Ketik kode ini saat diminta\n');
            }

            if (connection === 'close') {
                isConnected = false;
                currentQRCode = null;
                currentPairingCode = null;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const reason = lastDisconnect?.error?.message || 'Unknown Reason';

                console.log(`⚠️ Koneksi putus. Status: ${statusCode}, Detail: ${reason}`);
                console.log(`📊 Reconnect attempt: ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);

                // Handle session invalid/logout errors
                const shouldDeleteSession = [401, 403, 405, 411, 440].includes(statusCode) ||
                    statusCode === DisconnectReason.loggedOut;

                if (shouldDeleteSession) {
                    console.log(`❌ Sesi invalid atau Logout (${statusCode}). Menghapus folder sesi...`);
                    reconnectAttempts = 0;
                    if (fs.existsSync(AUTH_FOLDER)) {
                        fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
                    }
                    setTimeout(startWhatsApp, 3000);
                } else if (statusCode === DisconnectReason.restartRequired || statusCode === 515) {
                    // Immediate restart diperlukan
                    console.log(`🔄 Restart diperlukan (${statusCode}). Restart segera...`);
                    reconnectAttempts = 0;
                    startWhatsApp();
                } else {
                    // Network/connection error - exponential backoff
                    reconnectAttempts++;
                    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
                        console.error(`❌ Gagal connect setelah ${MAX_RECONNECT_ATTEMPTS} percobaan. Reset dan coba lagi...`);
                        reconnectAttempts = 0;
                        if (fs.existsSync(AUTH_FOLDER)) {
                            fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
                        }
                        setTimeout(startWhatsApp, 15000);
                    } else {
                        // Exponential backoff: 10s, 15s, 20s, 25s, 30s, etc
                        const delayMs = Math.min(10000 + (reconnectAttempts * 5000), 60000);
                        console.log(`⏳ Menghubungkan ulang dalam ${delayMs / 1000} detik...`);
                        setTimeout(startWhatsApp, delayMs);
                    }
                }
            } else if (connection === 'open') {
                isConnected = true;
                reconnectAttempts = 0;
                currentQRCode = null;
                currentPairingCode = null;
                console.log('✅ Terhubung ke WhatsApp!');

                try {
                    await sock.sendPresenceUpdate('available');
                    console.log('📱 Status: Online');
                } catch (e) {
                    console.error('Error setting presence:', e.message);
                }

                try {
                    const adminMsg = `🤖 *F-PEDIA Bot Online!*\n\n` +
                        `Bot WhatsApp berhasil terhubung.\n` +
                        `Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                        `Ketik *!status* untuk mengecek kesehatan bot.`;
                    await sendWhatsAppMessage(ADMIN_NUMBER, adminMsg);
                } catch (e) {
                    console.error('Error sending welcome message:', e.message);
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // Handler Pesan (Admin Commands)
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const sender = msg.key.remoteJid;
            const messageText = msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                '';

            const isAdmin = sender.startsWith(ADMIN_NUMBER);

            if (isAdmin && messageText.toLowerCase() === '!status') {
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);

                const statusMsg = `📊 *Status F-PEDIA Bot*\n\n` +
                    `• *Koneksi:* ✅ Terhubung\n` +
                    `• *Uptime:* ${hours} jam ${minutes} menit\n` +
                    `• *Memory:* ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB\n` +
                    `• *Queue:* ${supabase ? 'Aktif' : '❌ Supabase Error'}\n\n` +
                    `Bot berjalan normal di Hugging Face.`;

                await sendWhatsAppMessage(ADMIN_NUMBER, statusMsg);
            }
        });

        // Antrean (Queue Processor)
        if (global.queueInterval) clearInterval(global.queueInterval);
        global.queueInterval = setInterval(async () => {
            if (isConnected && supabase) await processQueue();
        }, 8000); // Jeda antar polling 8 detik agar tidak rate limit

    } catch (err) {
        console.error('🔥 Error Fatal saat inisialisasi:', err.message);
        
        reconnectAttempts++;
        if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
            console.error(`❌ Gagal initialize setelah ${MAX_RECONNECT_ATTEMPTS} percobaan.`);
            if (fs.existsSync(AUTH_FOLDER)) {
                fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
            }
            reconnectAttempts = 0;
            setTimeout(startWhatsApp, 20000);
        } else {
            const delayMs = Math.min(10000 + (reconnectAttempts * 5000), 60000);
            console.log(`⏳ Retry initialization dalam ${delayMs / 1000} detik... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            setTimeout(startWhatsApp, delayMs);
        }
    }
}

// ============================================================
// 📤 FUNGSI KIRIM & PROSES
// ============================================================
async function sendWhatsAppMessage(phone, message) {
    if (!sock || !isConnected) return;
    try {
        const remoteJid = phone.includes('@') ? phone : `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
        await sock.sendMessage(remoteJid, { text: message });
    } catch (e) {
        console.error(`❌ Gagal kirim pesan ke ${phone}:`, e.message);
    }
}

async function processQueue() {
    try {
        const { data: queue } = await supabase
            .from('whatsapp_queue')
            .select('*')
            .eq('status', 'pending')
            .limit(3); // Ambil 3 pesan per polling

        if (!queue?.length) return;

        console.log(`📥 Memproses ${queue.length} pesan antrean...`);
        for (const item of queue) {
            try {
                await sendWhatsAppMessage(item.phone, item.message);
                await supabase.from('whatsapp_queue').update({ status: 'sent', updated_at: new Date() }).eq('id', item.id);
                console.log(`✅ Terkirim ke ${item.phone}`);
            } catch (e) {
                console.error(`❌ Antrean gagal (${item.phone}):`, e.message);
                await supabase.from('whatsapp_queue').update({ status: 'failed', updated_at: new Date() }).eq('id', item.id);
            }
            // Jeda antar pesan agar tidak dianggap spam
            await new Promise(r => setTimeout(r, 4000));
        }
    } catch (e) {
        console.error('Antrean Error:', e.message);
    }
}

// Start
startWhatsApp();