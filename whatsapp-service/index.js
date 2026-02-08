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

// ============================================================
// 🔧 KONFIGURASI ENVIRONMENT
// ============================================================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const PORT = process.env.PORT || 7860;
const AUTH_FOLDER = 'auth_info_baileys';
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '6285814581266';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: SUPABASE_URL & SUPABASE_KEY wajib diisi!');
    process.exit(1);
}

// ============================================================
// 📦 INISIALISASI SUPABASE & SERVER
// ============================================================
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('WhatsApp Service Running');
});

server.listen(PORT, () => console.log(`🚀 Server di port ${PORT}`));

// ============================================================
// 📱 FUNGSI UTAMA WHATSAPP
// ============================================================
let sock = null;
let isConnected = false;

async function startWhatsApp() {
    // 1. Ambil Versi WA Terbaru dari Server (PENTING untuk hindari 405)
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🔄 Menggunakan WA versi: v${version.join('.')} (Latest: ${isLatest})`);

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    sock = makeWASocket({
        version, // Gunakan versi terbaru
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        // 2. GANTI BROWSER KE UBUNTU/CHROME (Jangan pakai nama custom)
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        // 3. Optimasi agar tidak berat
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n======================================================');
            console.log('⚡ SCAN QR CODE DI BAWAH INI ⚡');
            console.log('======================================================\n');
            // Tampilkan QR
            console.log(await QRCode.toString(qr, { type: 'terminal', small: true }));
        }

        if (connection === 'close') {
            isConnected = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(`⚠️ Koneksi putus. Status: ${statusCode}`);

            const shouldDeleteSession =
                statusCode === DisconnectReason.loggedOut ||
                statusCode === 401 ||
                statusCode === 403 ||
                statusCode === 405; // Method Not Allowed

            if (shouldDeleteSession) {
                console.log(`❌ Sesi invalid (${statusCode}). Resetting...`);
                if (fs.existsSync(AUTH_FOLDER)) {
                    fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
                }
                startWhatsApp();
            } else {
                console.log('⏳ Reconnecting...');
                setTimeout(startWhatsApp, 3000);
            }
        } else if (connection === 'open') {
            isConnected = true;
            console.log('✅ Terhubung ke WhatsApp!');

            // Set presence to "available" agar terlihat online
            try {
                await sock.sendPresenceUpdate('available');
                console.log('📱 Status: Online');
            } catch (e) {
                console.log('⚠️ Gagal set presence:', e.message);
            }

            // Kirim notifikasi ke admin
            try {
                const adminMsg = `🤖 *F-PEDIA Bot Online!*\n\n` +
                    `Bot WhatsApp berhasil terhubung.\n` +
                    `Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                    `Bot siap mengirim notifikasi order.`;
                await sendWhatsAppMessage(ADMIN_NUMBER, adminMsg);
                console.log('📤 Notifikasi terkirim ke admin:', ADMIN_NUMBER);
            } catch (e) {
                console.log('⚠️ Gagal kirim notifikasi ke admin:', e.message);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Queue Processor
    if (global.queueInterval) clearInterval(global.queueInterval);
    global.queueInterval = setInterval(async () => {
        if (isConnected) await processQueue();
    }, 5000);
}

// ============================================================
// 📤 FUNGSI KIRIM & PROSES
// ============================================================
async function sendWhatsAppMessage(phone, message) {
    if (!sock || !isConnected) throw new Error('WA Disconnected');
    const remoteJid = phone.includes('@') ? phone : `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
    await sock.sendMessage(remoteJid, { text: message });
}

async function processQueue() {
    try {
        const { data: queue } = await supabase
            .from('whatsapp_queue')
            .select('*')
            .eq('status', 'pending')
            .limit(5);

        if (!queue?.length) return;

        console.log(`📥 Memproses ${queue.length} antrean...`);
        for (const item of queue) {
            try {
                await sendWhatsAppMessage(item.phone, item.message);
                await supabase.from('whatsapp_queue').update({ status: 'sent', updated_at: new Date() }).eq('id', item.id);
                console.log(`✅ Sent to ${item.phone}`);
            } catch (e) {
                console.error(`❌ Fail ${item.phone}:`, e.message);
                await supabase.from('whatsapp_queue').update({ status: 'failed', updated_at: new Date() }).eq('id', item.id);
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    } catch (e) {
        console.error('Queue Error:', e.message);
    }
}

// Start
startWhatsApp();