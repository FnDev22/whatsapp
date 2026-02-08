# F-PEDIA WhatsApp Service - Troubleshooting Guide

## Overview
Panduan lengkap untuk mengatasi masalah WhatsApp Service di Hugging Face Spaces.

---

## 🔍 Connection Issues

### Problem: Status 408 - WebSocket Timeout
```
WebSocket Error (getaddressinfo ENOTFOUND web.whatsapp.com)
Status: 408
```

**Root Cause:**
- Network connectivity delay di container Hugging Face
- WhatsApp server temporary unavailable
- DNS resolution timeout

**Solution:**
1. **Let it retry automatically** - Bot akan autom. retry dengan exponential backoff:
   - Attempt 1: 10 detik
   - Attempt 2: 15 detik  
   - Attempt 3: 20 detik
   - ... naik 5 detik setiap attempt
   - Max: 60 detik delay

2. **Monitor the logs:**
   ```
   ⏳ Menunggu 5 detik untuk memastikan network siap...
   🔄 Menggunakan WA versi: v2.3000.xxxx
   ✅ Terhubung ke WhatsApp!
   ```

3. **If it fails after 10 attempts:**
   - Bot otomatis delete session folder
   - Bot restart dari awal
   - QR code akan di-generate lagi

4. **Manual intervention (jika perlu):**
   - Jangan click Restart berulang kali!
   - Tunggu minimal 5 detik antara restarts
   - Cek timestamp terakhir di logs sebelum action

---

### Problem: Status 401/403 - Session Invalid
```
❌ Sesi invalid atau Logout (403)
Menghapus folder sesi...
```

**Root Cause:**
- WhatsApp session expired
- Account logged out dari device lain
- Credentials corrupted

**Solution:**
1. Bot **automatically** delete session folder
2. Bot akan minta scan QR code lagi
3. Cek logs untuk QR code terminal display
4. Scan dengan WhatsApp yang BERBEDA device dengan yang sekarang aktif

---

## 🚑 Recovery Strategies

### Strategy 1: Let It Auto-Recover
- Bot memiliki auto-recovery built-in
- Exponential backoff prevents rate-limiting
- Session auto-reset setelah N failed attempts
- **Best for:** Temporary network issues

### Strategy 2: Manual Restart
1. Go to Space Settings
2. Click "Restart Space"
3. Wait untuk build selesai
4. Monitor logs untuk progress
5. Scan QR jika muncul

**Timing:** 
- First restart: 2-3 menit setelah initial failure
- Subsequent: Wait 5 menit between attempts

### Strategy 3: Factory Reset
Jika semua cara di atas tidak bekerja:
1. Delete file/folder di Space secara manual
2. Commit perubahan
3. Restart Space
4. Bot akan re-create auth folder
5. Scan QR code yang baru

---

## 📊 Health Check

### Check Bot Status
```bash
# Via HTTP
curl https://your-space.hf.space/health

# Expected response:
{
  "status": "connected",  // atau "disconnected"
  "uptime": 12345,       // dalam seconds
  "supabase": true       // credentials valid
}
```

### Check Logs Patterns
✅ **Good signs:**
```
✅ Terhubung ke WhatsApp!
📱 Status: Online
✅ Terkirim ke 628...
```

⚠️ **Warning signs:**
```
⏳ Menghubungkan ulang dalam 10 detik...
📊 Reconnect attempt: 3/10
```

❌ **Error signs:**
```
🔥 Error Fatal
WebSocket Error
Connection timeout
```

---

## 🔧 Configuration Checks

### 1. Environment Variables Validation

**Check apakah sudah set di HF Settings:**
```
✓ NEXT_PUBLIC_SUPABASE_URL
✓ SUPABASE_SERVICE_ROLE_KEY
✓ ADMIN_WHATSAPP_NUMBER
✓ PORT (default: 7860)
```

**Verify:**
```javascript
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials!');
}
```

### 2. Supabase Connectivity

Dari logs, cek:
```
✅ Supabase credentials sudah dikonfigurasi  // Good
⚠️ WARNING: Supabase credentials belum dikonfigurasi!  // Bad
```

**Test Supabase:**
```bash
curl -H "Authorization: Bearer YOUR_KEY" \
     https://your-project.supabase.co/rest/v1/whatsapp_queue?select=*&limit=1
```

---

## 📋 Debugging Checklist

- [ ] Check /health endpoint
- [ ] Verify environment variables di HF Settings
- [ ] Check logs untuk QR code
- [ ] Status harus "connected" (not "disconnected")
- [ ] Supabase connection aktif
- [ ] Auth folder ter-create di container
- [ ] Firewall/Network tidak block WhatsApp servers

---

## 🆘 Emergency Procedures

### If Bot Keep Cycling (infinite reconnect loop)
1. Stop the Space: Settings → Stop
2. Wait 30 detik
3. Start lagi
4. Check logs dalam 2 menit pertama
5. Jika masih loop, exec hard reset

### Hard Reset Commands
```bash
# Delete auth folder
rm -rf auth_info_baileys

# Create fresh
mkdir -p auth_info_baileys

# Restart service
systemctl restart whatsapp-service
```

### If Logs Not Appearing
1. Refresh page (F5)
2. Scroll ke bottom
3. Check timestamp (should be recent)
4. Jika masih blank, container mungkin crash
5. Click "Restart Space"

---

## 💡 Pro Tips

1. **First time connection:**
   - Bisa makan 1-2 menit untuk fully connected
   - QR code mungkin tidak tampe saat pertama
   - Tunggu sampai "✅ Terhubung ke WhatsApp!"

2. **Prevent reconnect loops:**
   - Don't restart manually terlalu sering
   - Let exponential backoff mechanism work
   - Check /health endpoint sebelum action

3. **Session management:**
   - Session ini di-share satu bot saja
   - Jangan login WhatsApp yang sama di device lain
   - Bot auto-detect dan logout jika terdeteksi multi-device

4. **Monitor memory:**
   - Check logs untuk memory usage
   - If > 400MB, might need container upgrade
   - Queue processing butuh stable memory

5. **Queue processing:**
   - Polling every 8 seconds
   - Process 3 messages per polling
   - 4-second delay between messages (anti-spam)
   - Check `whatsapp_queue` table di Supabase

---

## 📞 Support Resources

### Logs to Include (jika report bug):
```
1. Full error message dengan timestamp
2. Status code (408, 401, dll)
3. Environment variables (JANGAN share actual keys!)
4. Last 50 lines dari logs
5. /health endpoint response
```

### Common Success Cases:
- Bot reconnect otomatis dalam 30 detik
- QR code scan successful
- Status "connected" muncul dalam 2 menit
- Messages sent dalam 5 detik dari queue

---

## 📈 Version Info
- Node.js: 20 LTS
- Baileys: 7.0.0-rc.9
- WhatsApp API: Latest (auto-updated)
- Supabase: 2.48.1

Last Updated: February 2026
