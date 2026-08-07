# GudangPro — Panduan Deploy (versi ringkas)

## File yang di-upload

| File | Ukuran | Keterangan |
|------|--------|------------|
| `index.html` | ~165 KB | Sudah di-minify (CSS + JS) |
| `products-seed.js` | ~718 KB | Data 6.883 produk (sudah di-minify) |
| `MIGRATION.md` | opsional | Dokumentasi migrasi |

**Total ~0,9 MB** (turun dari ~1,9 MB).

---

## Penyebab gagal deploy yang sering terjadi

1. **File `products-seed.js` tidak ikut di-upload**  
   → Error di console: `products-seed.js tidak ditemukan`.  
   **Solusi:** Upload **kedua** file (`index.html` + `products-seed.js`) di **folder yang sama**.

2. **Path salah / nested folder**  
   Hosting seperti GitHub Pages / Netlify / Firebase:  
   - Root site harus berisi `index.html` dan `products-seed.js` langsung.  
   - Jangan taruh di subfolder kecuali URL-nya disesuaikan.

3. **Cache browser / CDN lama**  
   Setelah upload, hard-refresh (`Ctrl+Shift+R`) atau buka mode incognito.

4. **Ukuran file terlalu besar (hosting tertentu)**  
   Versi asli ~1,9 MB. Versi ini sudah dikurangi ~50%.  
   Jika masih gagal:
   - Pakai **Firebase Hosting** / **Netlify** / **Cloudflare Pages** (limit jauh lebih besar).
   - Atau upload `products-seed.js` ke storage terpisah lalu ubah `src` di HTML (lihat di bawah).

5. **Firebase config**  
   Pastikan project Firebase (`hostinglb-6428b`) sudah enable Authentication + Firestore, dan domain hosting sudah di-whitelist di Firebase Console → Authentication → Settings → Authorized domains.

---

## Cara deploy cepat

### A. Firebase Hosting (disarankan)

```bash
npm i -g firebase-tools
firebase login
firebase init hosting   # pilih folder yang berisi index.html + products-seed.js
firebase deploy --only hosting
```

### B. GitHub Pages

1. Buat repo, upload `index.html` + `products-seed.js` ke root (atau folder `docs/`).
2. Settings → Pages → Source: Deploy from branch `main` / folder `/` atau `/docs`.
3. Tunggu 1–2 menit, buka `https://username.github.io/repo/`.

### C. Netlify / Cloudflare Pages

- Drag & drop folder berisi kedua file, atau connect ke Git.

---

## Jika ingin seed lebih kecil lagi (opsional)

Seed masih ~718 KB karena berisi 6.883 produk. Opsi:

1. **Load dari JSON eksternal** (bisa di-cache CDN):
   - Ganti `<script src="products-seed.js">` menjadi fetch ke `products-data.json`.
   - Butuh sedikit ubah fungsi `getSeedProducts()` di kode.

2. **Split seed** menjadi beberapa file (mis. per huruf) — lebih kompleks.

Untuk kebanyakan kasus, versi minified ini sudah cukup untuk deploy lancar.

---

## Cek setelah deploy

1. Buka site → Console (F12) harus muncul:
   ```
   [GudangPro] Firebase connected: hostinglb-6428b
   ```
   atau warning seed jika file hilang.
2. Login demo (jika masih aktif): lihat di Pengaturan / seed user.
3. Menu **Master Produk** → harus ada ±6.883 item.

---

## Rollback ke versi tidak di-minify

Simpan backup `index.html` + `products-seed.js` asli sebelum overwrite. Versi minified **fungsional sama**, hanya whitespace/comment dihapus.
