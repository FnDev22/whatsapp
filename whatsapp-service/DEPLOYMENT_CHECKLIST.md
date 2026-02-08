# F-PEDIA WhatsApp Service - Deployment Checklist

Gunakan checklist ini sebelum & sesudah deploy ke Hugging Face Spaces.

## Pre-Deployment Checklist

### Code & Files
- [ ] All files updated locally
- [ ] No syntax errors (`npm run lint` if available)
- [ ] `.env` file sudah di-create dengan valid credentials
- [ ] `.gitignore` contains sensitive files
- [ ] `auth_info_baileys/` folder excluded dari git

### Environment Variables
- [ ] Supabase URL copied correctly (dengan https://)
- [ ] Service Role Key copied correctly (full token)
- [ ] Admin WhatsApp number format: `628xxxxxxxxxx` (no +, no spaces)
- [ ] PORT set to `7860`

### Repository
- [ ] Push all changes ke GitHub/repository
- [ ] Commit message clear dan descriptive
- [ ] Main branch stable (no pending changes)

---

## Deployment Steps

### Step 1: Create Space
1. Go to huggingface.co/new-space
2. **Name:** `whatsapp-service` atau `f-pedia-whatsapp`
3. **License:** MIT 
4. **SDK:** Docker ✓
5. Click "Create Space"

### Step 2: Configure Git
```bash
# Di terminal lokal
git clone https://huggingface.co/spaces/your-username/whatsapp-service
cd whatsapp-service
git checkout -b main  # atau gunakan branch yang ada
```

### Step 3: Copy Files
```bash
# Copy files dari project lokal
cp -r path/to/whatsapp-service/* .
```

### Step 4: Push ke HF
```bash
git add .
git commit -m "Deploy WhatsApp service with fixes"
git push origin main  # or your branch
```

### Step 5: Configure Secrets
Di **Space Settings → Repository secrets**, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://...supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhb...` |
| `ADMIN_WHATSAPP_NUMBER` | `628xxxxxxxxxx` |

**IMPORTANT:** 
- Don't use `.env` file di HF
- Use Repository secrets saja
- Double-check values sebelum save

### Step 6: Build & Deploy
1. Push terpopulasi otomatis memicu build
2. Check **Building** tab untuk progress
3. Wait untuk "Successfully deployed"
4. Check **Logs** tab untuk errors

---

## Post-Deployment Verification

### Step 1: Check Health Endpoint (dalam 2 menit)
```bash
curl https://your-username-whatsapp-service.hf.space/health
```

Expected response:
```json
{
  "status": "disconnected",  // normal jika baru pertama
  "uptime": 10,
  "supabase": true
}
```

### Step 2: Monitor Logs
1. Open **Container** tab di Space
2. Cari QR code string di logs:
   ```
   ⚡ SCAN QR CODE DI BAWAH INI ⚡
   █████...
   ```
3. Scan dengan WhatsApp device

### Step 3: Verify Connection
Tunggu sampai status menjadi:
```
✅ Terhubung ke WhatsApp!
📱 Status: Online
```

Ini bisa butuh:
- **First time:** 1-2 menit (includes setup delay)
- **Subsequent:** 20-30 detik

### Step 4: Test Message Sending
1. Send test message via Supabase
2. Check whatsapp_queue table (status should be "pending")
3. Monitor logs untuk:
   ```
   ✅ Terkirim ke 628...
   ```
4. Check phone untuk confirm message

---

## Troubleshooting During Deployment

### Issue: Build Failed
```
Error: App failed to build
```
**Check:**
- [ ] Dockerfile syntax valid
- [ ] All required files present
- [ ] Node modules installable
- [ ] No circular dependencies

**Solution:**
- Check Docker build logs
- Fix errors dalam code
- Commit & push again

### Issue: Container Keep Restarting
```
Health status: unhealthy
```
**Check:**
- [ ] Environment variables set
- [ ] PORT=7860
- [ ] Supabase credentials valid
- [ ] Network access available

**Solution:**
- View full container logs
- Check variables di Settings
- Wait 5 menit untuk auto-recovery

### Issue: QR Code Not Showing
**Wait at least:**
- 10 seconds after deploy starts
- 30 seconds if network slow
- 2 minutes jika first time

**Then refresh logs**, QR code akan muncul

### Issue: Status Disconnected (30+ minit)
**Step 1:** Check logs untuk errors
**Step 2:** Restart container (Settings → Restart)
**Step 3:** Wait 5 menit untuk recovery
**Step 4:** If still disconnected, check:
- Supabase credentials valid?
- Network blocked WhatsApp?
- Rate limited?

---

## Performance Checklist

- [ ] `/health` responds < 100ms
- [ ] Logs show clear messages (not garbled)
- [ ] No memory leaks (memory stable)
- [ ] Queue processes messages < 5s
- [ ] Bot stays connected for hours
- [ ] Auto-recovery works on disconnect

---

## Security Checklist

- [ ] `.env` file NOT committed di git
- [ ] API keys NOT in logs
- [ ] Secrets only in HF Repository secrets
- [ ] `.gitignore` properly configured
- [ ] `auth_info_baileys/` excluded
- [ ] No credentials di README

---

## Maintenance Schedule

### Daily (automated)
- Health checks every 30s
- Queue polling every 8s
- Message processing every ~5s

### Weekly (manual)
- Check Health endpoint
- Verify logs for errors
- Check message delivery ratio

### Monthly (manual)
- Review disk usage (auth_info_baileys folder)
- Update Node.js dependencies jika available
- Check WhatsApp API updates

---

## Rollback Procedure

Jika ada problem serius:

```bash
# Revert ke commit terakhir yang stabil
git revert HEAD
git push origin main

# Atau reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

**Note:** Force push butuh credentials, tidak recommended untuk shared repos

---

## Quick Commands Reference

```bash
# Local test (dengan Docker)
docker-compose up

# View logs real-time
docker-compose logs -f

# Stop service
docker-compose down

# Clean everything
docker-compose down -v
rm -rf auth_info_baileys node_modules
```

---

## Support & Resources

- 📖 [README.md](./README.md) - Overview & setup
- 🆘 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Detailed troubleshooting
- 📚 [Baileys Docs](https://github.com/WhiskeySockets/Baileys)
- 🟨 [Supabase Docs](https://supabase.com/docs)
- 🤗 [HF Spaces Docs](https://huggingface.co/docs/hub/spaces)

---

**Last Updated:** February 2026
**Status:** Ready for Production
