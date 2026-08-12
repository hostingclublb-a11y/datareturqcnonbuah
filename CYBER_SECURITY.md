# GudangPro – Security Hardening

## Yang sudah diperbaiki di build ini

1. **Tidak ada lagi system-key/password admin di source HTML/JavaScript.**
2. **Tidak ada login password dari localStorage.** Login wajib melalui Firebase Authentication.
3. **Session tidak lagi dipercaya dari localStorage.** Saat halaman dibuka ulang, akun diverifikasi kembali melalui `auth.onAuthStateChanged()` dan profil `users/{uid}` di Firestore.
4. Semua operasi server penting sekarang memerlukan Firebase Auth aktif dan akun tidak `locked`/`pending`.
5. Pembuatan user dari menu admin memakai Firebase App sekunder agar sesi administrator tidak diganti oleh akun user baru.
6. Password UI dinaikkan minimal menjadi 8 karakter.
7. Client-side role checking tetap dipakai untuk UI, tetapi **otorisasi sebenarnya harus ditegakkan oleh Firestore Security Rules**.
8. Aktivitas PRINT/CREATE/UPDATE/DELETE tetap dicatat ke `activityLog`.

## Wajib dilakukan di Firebase Console

Deploy `firestore.rules` ini ke Firestore Rules. Tanpa rules server-side, pemeriksaan role di JavaScript tidak cukup aman karena kode browser dapat dimodifikasi pengguna.

Aktifkan juga:
- Firebase Authentication → Email/Password.
- Password policy yang lebih kuat (disarankan minimal 8–12 karakter).
- App Check untuk web jika domain produksi sudah siap.
- Monitoring Authentication dan Firestore usage.
- Backup/export Firestore secara berkala.

## Catatan login NIK

Build ini masih memiliki alur pencarian username/NIK sebelum `signInWithEmailAndPassword`. Untuk keamanan maksimum, sebaiknya login publik menggunakan email atau dibuatkan Cloud Function khusus `resolveUsernameToEmail`, sehingga koleksi `users` tidak perlu dibuka untuk pencarian sebelum autentikasi.

## Verifikasi yang dilakukan terhadap kode

- Firebase App/Auth/Firestore SDK terpasang.
- Koleksi realtime: `notaRetur`, `products`, `vendorPic`, `warehouses`, `auditHistory`, `meta/categories`, `meta/racks`, `meta/settings`, `activityLog`, `users`, `drafts/cart`, `drafts/audit`.
- JavaScript hasil patch lolos `node --check` setelah script HTML diekstrak.

## Batas verifikasi

File HTML tidak berisi Firestore Security Rules dan tidak dapat membuktikan bahwa rules yang saat ini terpasang di project Firebase sudah benar. Karena itu rules harus dideploy dan diuji di Firebase Console/Emulator.
