# 🚂 Railway Deployment Guide

Step-by-step setup F-PEDIA WhatsApp Service di Railway.

---

## ✅ Pre-Deployment Checklist

- [ ] GitHub account & repository siap
- [ ] Repository berisi:
  - [ ] `Dockerfile`
  - [ ] `railway.json`
  - [ ] `package.json`
  - [ ] `index.js`
  - [ ] `.railwayignore`
- [ ] Environment variables siap:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `ADMIN_WHATSAPP_NUMBER`

---

## 🚀 Step 1-5: Create Railway Project

### Step 1: Go to Railway
- Open: https://railway.app
- Click **"New Project"** button (center screen)

### Step 2: Select Deployment Method
- Click **"GitHub Repo"**
- Click **"Connect GitHub"** (jika belum)
- Authorize Railway ke GitHub

### Step 3: Select Repository
- Cari repository: `whatsapp-service` atau `F-PEDIA`
- Click repo tersebut
- Click **"Deploy Now"**

Railway akan:
- ✅ Auto-detect `Dockerfile`
- ✅ Build Docker image
- ✅ Deploy container
- Takes: ~5-10 minit

### Step 4: Wait for Deployment
Dashboard akan show:
```
📦 Building...
-> Pushing image
-> Container starting
✅ Deployment successful
```

### Step 5: Configure Environment Variables
1. Di Railway dashboard, click project
2. Go to **Variables** tab
3. Click **"New Variable"** button
4. Add variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (full key) |
| `ADMIN_WHATSAPP_NUMBER` | `628xxxxxxxxxx` |
| `PORT` | `8000` |

**TIPS:**
- Copy dari `.env` file lokal
- Jangan pakai quotes
- Double-check values sebelum save

---

## 🔗 Step 6-7: Get URL & Test

### Step 6: Get Public URL
1. Go to **Deployments** tab
2. Click latest deployment
3. Copy **Public URL** (something like: `whatsapp-service-prod.up.railway.app`)

### Step 7: Test Endpoints
Open browser atau curl:

```bash
# Health check
curl https://whatsapp-service-prod.up.railway.app/health

# Should return:
{
  "status": "disconnected",  // normal saat baru pertama
  "uptime": 15,
  "supabase": true,
  "hasQR": false,
  "hasPairingCode": false
}

# Info endpoint
curl https://whatsapp-service-prod.up.railway.app/info
```

---

## 📱 Step 8-9: Scan QR Code

### Step 8: Monitor Logs
1. Di Railway dashboard, go to **Logs** tab
2. Wait untuk see output seperti:
```
======================================================
🤖 F-PEDIA WhatsApp Service - Startup
======================================================
Node Version: v20.x.x
Process ID: 1
Platform: linux
Memory Available: XXX GB
✅ Supabase credentials sudah dikonfigurasi
======================================================

⏳ Memulai koneksi WhatsApp...
📁 Membuat folder auth_info_baileys...
⏰ Menunggu 5 detik untuk memastikan network siap...
🔄 Menggunakan WA versi: v2.3000.xxxxx
⚡ SCAN QR CODE ⚡
```

### Step 9: Scan QR Code
2 methods:

**Method A: Scan dari Image URL**
```
https://whatsapp-service-prod.up.railway.app/qr
```
- Open di browser
- You'll see QR code image
- Scan dengan WhatsApp phone

**Method B: Copy Pairing Code dari Logs**
```
💬 PAIRING CODE (Alternative Method):
📌 Code: 123456
👉 Buka WhatsApp → Settings → Linked Devices → Link Device
👉 Ketik kode ini saat diminta
```

---

## ✅ Step 10: Verify Connection

Wait untuk see di logs:
```
✅ Terhubung ke WhatsApp!
📱 Status: Online
🤖 *F-PEDIA Bot Online!*
```

Check health endpoint:
```bash
curl https://whatsapp-service-prod.up.railway.app/health

Response akan berubah ke:
{
  "status": "connected",  // ✅ Success!
  "uptime": 120,
  "supabase": true,
  "hasQR": false,
  "hasPairingCode": false
}
```

---

## 🧪 Step 11: Test Message Sending

1. **Add message ke Supabase queue:**
   ```sql
   INSERT INTO whatsapp_queue (phone, message, status)
   VALUES ('628xxxxxxxxxx', 'Hello test!', 'pending');
   ```

2. **Monitor Logs untuk:**
   ```
   📥 Memproses 1 pesan antrean...
   ✅ Terkirim ke 628xxxxxxxxxx
   ```

3. **Check WhatsApp:**
   - Message should appear dalam 5-10 detik

---

## 🔄 Auto-Deploy (Optional)

Railway automatically redeploy ketika:
- ✅ Push ke main branch
- ✅ Environment variables changed
- ✅ Manual trigger (click "Redeploy" button)

Tidak perlu deploy ulang manual lagi!

---

## 📊 Monitoring

### Logs
- Real-time logs di **Logs** tab
- Scroll untuk see QR code dan connection status
- Refresh page jika logs tidak update

### Health Check
Check endpoint setiap 5 minit:
```bash
curl https://your-railway-url.up.railway.app/health
```

### CPU & Memory
- Go to **Monitoring** tab
- Check usage
- Alert jika > 80%

---

## 🛠️ Troubleshooting

### Issue: Build Failed
```
Error during Docker build
```
**Solution:**
- Check Logs tab untuk error detail
- Ensure Dockerfile valid
- Fix errors, push ke git lagi

### Issue: Container Keep Crashing
```
Container exited with code 1
```
**Solutions:**
1. Check Variables (pastikan semua diset)
2. Check Logs untuk actual error message
3. Restart service (click "Restart" button)

### Issue: Connection Timeout (408)
```
ENOTFOUND web.whatsapp.com
```
**Solution:**
- Wait beberapa menit (network initialization)
- Bot akan auto-retry dengan exponential backoff
- Check after 5 minutes

### Issue: QR Code Not Showing
**Solution:**
- Wait 10-15 detik setelah container start
- Refresh logs tab
- Open `/qr` endpoint di browser
- If still blank, restart service

### Issue: Pairing Code Not Working
**Solution:**
1. Make sure WhatsApp app is updated
2. WhatsApp harus di device yang berbeda
3. Scroll logs untuk find pairing code
4. Try scan QR code method instead

---

## 📞 Emergency Procedures

### Force Restart Service
1. Go to **View Details** button
2. Click **"Restart"** button
3. Wait 30 detik untuk boot ulang

### Reset Session
1. Delete `auth_info_baileys` folder (via git)
2. Commit & push ke main
3. Railway auto-redeploy
4. QR code akan muncul lagi

### Check Container Logs
```bash
# Railway memberikan full logs di dashboard
# Last 100 lines di Logs tab
# Scroll up untuk see semua messages
```

---

## ✨ What's Next?

After bot is **connected**:

1. **Test queue processing:**
   - Insert message ke `whatsapp_queue` table
   - Bot akan auto-process setiap 8 detik

2. **Monitor uptime:**
   - Check health endpoint regularly
   - Monitor logs untuk errors

3. **Auto-deployments:**
   - Every push ke GitHub auto-deploys
   - No manual intervention needed

4. **Scale if needed:**
   - Railway can upgrade to paid tier
   - More vCPU, memory available

---

## 📝 Railway vs Other Platforms

| Feature | Railway | HF Spaces | Render |
|---------|---------|-----------|--------|
| Network | ✅✅✅ | ❌❌ | ✅✅✅ |
| Cost | $5/mo | Free | $7/mo |
| Setup | 5 min | 2 min | 10 min |
| Uptime | 99.5% | 95% | 99.9% |
| WhatsApp | ✅✅✅ | ❌ | ✅✅✅ |

---

## 📚 Useful Links

- Railway Dashboard: https://railway.app
- Railway CLI: `npm install -g @railway/cli`
- Docs: https://docs.railway.app
- Support: https://railway.app/contact

---

**Estimated Total Time: 15-20 minit**
- Project creation: 5 min
- Deployment: 3-5 min
- QR scan & connection: 5-10 min

✅ **Ready to deploy!**
