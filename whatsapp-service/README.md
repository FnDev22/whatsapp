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

## Cara Pakai

1. Deploy ke Hugging Face Spaces
2. Isi Environment Variables di Settings
3. Cek Logs untuk scan QR atau lihat Pairing Code
4. Bot siap mengirim notifikasi!
