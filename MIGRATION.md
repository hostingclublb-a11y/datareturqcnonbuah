# Skema Migrasi Data — GudangPro v2.0

Dokumen ini menjelaskan cara data dari **aplikasi Retur Barang (v1)** dipindahkan ke **GudangPro Enterprise v2.0**.

Migrasi bersifat **otomatis**, **idempotent** (aman dijalankan berulang), dan **non-destruktif**.

---

## 1. Ringkasan

| Aspek | Keterangan |
|-------|------------|
| Trigger | Otomatis saat pertama kali `index.html` v2 dibuka di browser yang sama |
| Flag | `localStorage['gp:migrated_v2']` — mencegah migrasi berulang |
| Prefix lama | `retur_app_<key>` |
| Prefix baru | `gp:<key>` |
| Produk default | 6.883 item dari `products-seed.js` (database Excel yang dibersihkan) |

---

## 2. Mapping Key Storage

### 2.1 Key yang Dimigrasi Otomatis

| Key Lama (v1) | Key Baru (v2) | Transformasi |
|---------------|---------------|--------------|
| `retur_app_retur:dcname` | `gp:dcName` | String langsung |
| `retur_app_retur:cart` | `gp:cart` | Array item retur (struktur sama) |
| `retur_app_retur:history` | `gp:history` | Array nota — merge by `nomor` jika sudah ada data |
| `retur_app_audit:list` | `gp:auditList` | Array audit EXP |
| `retur_app_items:master` | `gp:products` | Compact array → object (lihat §3) |

### 2.2 Key yang Tidak Dimigrasi (sengaja)

| Key Lama | Alasan |
|----------|--------|
| `retur_app_items:meta` | Digantikan seed database v2 + meta baru |
| `retur_app_banding:list` | Struktur berubah; user input ulang lebih aman |
| `retur_app_banding:ref` | File referensi perlu di-upload ulang |

### 2.3 Key Baru di v2 (tidak ada di v1)

| Key Baru | Isi |
|----------|-----|
| `gp:categories` | Daftar kategori (dari seed / master) |
| `gp:vendors` | Daftar vendor |
| `gp:racks` | Master rak |
| `gp:warehouses` | Master gudang / DC |
| `gp:users` | Master user & role |
| `gp:auditHistory` | Riwayat sesi audit (baru) |
| `gp:activityLog` | Jejak semua aktivitas + export |
| `gp:sysName` | Nama sistem |
| `gp:session` | Session login |
| `gp:migrated_v2` | Flag migrasi |

---

## 3. Transformasi Format Produk

### Format Lama (`items:master`) — Compact Array

```js
[
  [nama, kode, kategori, pic, vendor, barcodes[]],
  ["ER MAKARONI USUS BESAR BALADO", "LB0117", "Snack", "DANANG IMAM SANTOSO", "ER SNACK", ["5800117"]],
  ...
]
```

### Format Baru (`gp:products`) — Object

```js
[
  {
    "kode": "LB0117",
    "barcode": "5800117",
    "nama": "ER MAKARONI USUS BESAR BALADO",
    "kategori": "Snack",
    "vendor": "ER SNACK",
    "pic": "DANANG IMAM SANTOSO",
    "barcodes": ["5800117"]   // opsional, multi-barcode
  },
  ...
]
```

### Aturan Konversi

1. Jika `items:master` berupa array-of-array → unpack sesuai urutan di atas.
2. Jika sudah berupa object (versi transisi) → normalisasi field.
3. `barcodes[0]` dijadikan `barcode` utama.
4. Kode kosong → digenerate `AUTO-xxxxxx`.
5. Migrasi produk **hanya** dijalankan jika `gp:products` masih kosong / < 50 item (agar tidak menimpa seed 6.883 produk atau data yang sudah di-import user).

---

## 4. Transformasi Nota Retur (History)

Struktur nota relatif kompatibel. Field yang dipakai v2:

```js
{
  "nomor": "RTR-20260803-0001",
  "judul": "",
  "tanggal": "2026-08-03",
  "tanggalLabel": "3 Agu 2026 21.30",
  "dcName": "DC INDUK",
  "items": [
    {
      "id": "...",
      "nama": "...",
      "kode": "...",
      "barcode": "...",
      "kategori": "...",
      "vendor": "...",
      "pic": "...",
      "qty": 2,
      "satuan": "PCS",
      "alasan": "Kadaluarsa / Expired",
      "catatan": ""
    }
  ],
  "createdByName": "Admin",
  "createdAt": "..."
}
```

**Merge strategy:** jika `gp:history` sudah berisi data, nota lama digabung berdasarkan `nomor` (tidak menimpa yang sudah ada).

---

## 5. Alur Migrasi Otomatis

```
[Buka index.html v2]
        │
        ▼
 loadState()
        │
        ▼
 migrateFromV1()
        │
        ├─ Flag gp:migrated_v2 ada? ──yes──► skip
        │
        no
        │
        ▼
 Baca localStorage key lama (retur_app_*)
        │
        ▼
 Konversi & tulis ke gp:*
        │
        ▼
 Set flag gp:migrated_v2 = { at, report }
        │
        ▼
 Lanjut load seed / data tersimpan
```

Log hasil migrasi bisa dilihat di **Console browser** (F12):

```
[GudangPro] Migrasi v1→v2 selesai: { migrated: true, items: { history: 12, cart: 3, ... } }
```

---

## 6. Migrasi Manual (Opsional)

### 6.1 Via Backup JSON (disarankan lintas perangkat)

**Di app lama / v1:**
1. Buka Pengaturan / Setup
2. Export / Backup data (jika ada)
3. Atau buka DevTools → Application → Local Storage → salin value key `retur_app_retur:history` dll.

**Di GudangPro v2:**
1. Menu **Pengaturan** → **Import Data**
2. Pilih file JSON backup
3. Atau gunakan **Master Produk → Import Excel** untuk database produk

### 6.2 Via Excel Database

File `database_produk_barcode_pic_vendor-19.xlsx` sudah dikonversi menjadi:

| File | Keterangan |
|------|------------|
| `products-seed.js` | 6.883 produk — dimuat otomatis |
| `products-data.json` | Format JSON murni (untuk tool eksternal) |

Kolom mapping Excel → sistem:

| Kolom Excel | Field Sistem |
|-------------|--------------|
| BARCODE | `barcode` |
| NAMA PRODUK | `nama` |
| KODE PRODUK | `kode` |
| KATEGORI | `kategori` |
| PIC | `pic` |
| VENDOR | `vendor` |

Nilai `"Tidak ditemukan di data Pembagian Per Item"` dan `"-"` dibersihkan menjadi string kosong.

---

## 7. Rollback

Jika ingin mengulang migrasi dari data lama:

```js
// Jalankan di Console browser (F12)
localStorage.removeItem('gp:migrated_v2');
location.reload();
```

Data `gp:*` yang sudah ada **tidak dihapus** otomatis. Untuk reset total:

```js
Object.keys(localStorage)
  .filter(k => k.startsWith('gp:'))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

Atau gunakan tombol **Reset Semua Data Lokal** di menu Pengaturan.

---

## 8. Checklist Go-Live

- [ ] Upload `index.html` + `products-seed.js` (+ opsional `products-data.json`) ke GitHub / hosting
- [ ] Buka aplikasi di browser yang sebelumnya dipakai app v1
- [ ] Cek Console: pastikan log migrasi muncul (jika ada data lama)
- [ ] Cek **Master Produk** → harus ada ±6.883 item
- [ ] Cek **Riwayat Retur** → nota lama muncul (jika ada)
- [ ] Cek **Pengaturan** → nama DC terbawa
- [ ] Uji Export (Excel / CSV / PDF) di salah satu modul
- [ ] Login demo: `admin` / `admin123`

---

## 9. Versi & Kompatibilitas

| Versi App | Storage Prefix | Format Produk | Migrasi ke v2 |
|-----------|----------------|---------------|---------------|
| Retur Barang (HTML lama) | `retur_app_` | Compact array | Otomatis |
| GudangPro v2.0 | `gp:` | Object | — |

**Catatan keamanan:** password user di seed default hanya untuk demo. Segera ganti / nonaktifkan di produksi, atau hubungkan ke backend auth (Firebase / API) sesuai kebutuhan.
'''
