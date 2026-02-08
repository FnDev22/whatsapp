---
title: F-PEDIA WhatsApp Service
emoji: 🤖
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# F-PEDIA WhatsApp Service

Bot WhatsApp untuk mengirim notifikasi otomatis ke user dan admin.

## ⚡ Quick Link
- 📖 **Setup Guide:** Lihat section [Setup di Hugging Face Spaces](#setup-di-hugging-face-spaces) di bawah
- 🆘 **Got Errors?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) untuk solusi detail
- ✅ **Deploy Checklist:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## Fitur

- ✅ **Notifikasi Pending Order** - Mengirim pesan ke user saat order dibuat
- ✅ **Notifikasi Payment Success** - Mengirim kredensial akun ke user setelah bayar
- ✅ **Notifikasi Admin** - Admin mendapat laporan lengkap setiap ada order sukses
- ✅ **Queue System** - Menggunakan Supabase queue untuk reliabilitas
- ✅ **Pairing Code** - Bisa login tanpa scan QR

## Environment Variables

| Variable | Keterangan |
|----------|------------|
| `SUPABASE_URL` | URL Supabase Project |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key Supabase |
| `PAIRING_PHONE_NUMBER` | Nomor WA untuk pairing (opsional, format: 62812345678) |
| `ADMIN_WHATSAPP_NUMBER` | Nomor admin untuk notifikasi (default: 6285814581266) |

## Setup di Hugging Face Spaces

### 1️⃣ Deploy Repository
- Fork atau upload repository ke Hugging Face Spaces
- Pilih Docker sebagai SDK
- Repository harus mengandung file `Dockerfile` dan `dockerignore`

### 2️⃣ Atur Environment Variables
Di Settings → Repository secrets, tambahkan:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_WHATSAPP_NUMBER=628xxxxxxxxxx
PORT=7860
```

### 3️⃣ Login WhatsApp
- Cek Logs bagian Container untuk melihat QR Code
- Scan QR dengan WhatsApp yang ingin digunakan
- Tunggu status berubah menjadi "connected"

### 4️⃣ Test Health Endpoint
Akses: `https://your-space-name.hf.space/health`

Expected response:
```json
{
  "status": "connected",
  "uptime": 125,
  "supabase": true
}
```

## Troubleshooting

### ❌ Error: WebSocket Error (408, 401, etc) atau ENOTFOUND web.whatsapp.com
**Penyebab:** Network connectivity issue dalam container, atau WhatsAppServers temporary down
**Solusi:**
1. **Restart Space** di Settings → Restart Space
2. Bot akan auto-reconnect dengan exponential backoff (10s, 15s, 20s, dll)
3. Tunggu sampai status berubah "connected" (bisa butuh 30-60 detik)
4. Jika tetap gagal setelah 10 attempts, bot akan reset session dan coba lagi otomatis
5. Monitor di Logs tab setiap 5 menit untuk progress

**Important Notes:**
- Status 408 = timeout - ini biasa terjadi di host HF pertama kalinya
- Jangan manual restart berulang kali, biarkan bot retry otomatis
- Exponential backoff mencegah rate-limiting dari WhatsApp

### ❌ Error: SUPABASE URL & KEY tidak ditemukan
**Penyebab:** Environment variables belum di-set
**Solusi:**
1. Buka Settings → Repository secrets
2. Tambahkan semua environment variables dari `.env.example`
3. Restart Space

### ❌ Folder auth_info_baileys tidak ada
**Penyebab:** Folder auto-dibuat saat pertama kali scan QR
**Solusi:**
- Tunggu 2-3 menit setelah container start
- Cek Logs untuk melihat progress
- Jika masih stuck, restart Space

### ❌ Bot tidak mengirim pesan
**Penyebab:** 
- WhatsApp belum connected
- Supabase credentials invalid
- Queue tidak ter-trigger

**Solusi:**
1. Pastikan `/health` menunjukkan `"status": "connected"`
2. Test Supabase connection dengan curl
3. Cek Supabase logs untuk queue processing

### 📚 More Troubleshooting
Untuk troubleshooting lebih detail dan emergency procedures, lihat **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

## Development Lokal

```bash
# Install dependencies
npm install

# Buat .env file (copy dari .env.example)
cp .env.example .env

# Isi values di .env
nano .env

# Run development
npm run dev

# Run production
npm start
```

## Struktur File

```
whatsapp-service/
├── index.js                 # Main application
├── package.json             # Dependencies
├── Dockerfile              # Docker config (Docker SDK)
├── .dockerignore            # Files excluded from Docker
├── .env                     # Environment variables (hidden)
├── .env.example             # Template environment variables
├── auth_info_baileys/       # WhatsApp session (auto-created)
├── README.md               # Documentation
└── README-HUGGINGFACE.md   # HF-specific guide (optional)
```

## API Endpoints

### Health Check
```
GET /health

Response:
{
  "status": "connected|disconnected",
  "uptime": 12345,
  "supabase": true
}
```

### Root
```
GET /

Response: F-PEDIA WhatsApp Service is Running
```

## Security Notes

⚠️ **JANGAN SHARE:**
- `.env` file dengan secrets
- `auth_info_baileys/` folder (berisi session data)
- API keys atau tokens

✅ **GUNAKAN:**
- `.env.example` untuk template
- `.dockerignore` untuk exclude sensitive files
- Hugging Face Repository Secrets untuk environment variables
