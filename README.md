# 🗳️ Portal Cek Lokasi TPS Pemilihan Kepala Desa Karang Satria (2026 - 2034)
**Kecamatan Tambun Utara, Kabupaten Bekasi, Jawa Barat**

Mobile Web App modern, cerah, segar, dan ramah di mata warga (Emerald Green & Gold Theme) yang fokus **100% langsung untuk pengecekan lokasi TPS warga berbasis NIK (16 Digit)**. Menggunakan Google Sheets sebagai database real-time dan Google Apps Script (GAS) sebagai backend gratis tanpa biaya server.

---

## 🏛️ Konsep & Alur Kerja:
1. Warga membuka Web App di HP (tampilan cerah, tulisan besar dan sangat mudah dibaca).
2. Warga memasukkan 16 digit NIK (atau klik tombol *Tempel* / tombol contoh sampel warga).
3. Klik tombol **"CEK LOKASI TPS SAYA"**.
4. **Langsung Muncul Kartu Pemilih Digital**:
   - Nomor & Lokasi TPS tempat mencoblos (contoh: **TPS 014 - Balai RW 018 Alamanda Regency**).
   - Data Pemilih (NIK dengan sensor keamanan, Nama Lengkap, TTL & Gender, Alamat KTP).
   - Dynamic QR Code resmi untuk verifikasi presensi di TPS oleh petugas.
   - Tombol **Cetak / Simpan PDF** dan **Kirim ke WhatsApp**.

---

## 📊 File Template Excel Langsung Siap Pakai:
- **[Template_DPS_DPT_Karang_Satria.xlsx](file:///sdcard/www/cek_dpt_gas/Template_DPS_DPT_Karang_Satria.xlsx)** — File Excel Workbook (.xlsx) dengan styling hijau desa, format kolom NIK text, dan 8 sampel data warga Desa Karang Satria.
- **[Template_DPS_DPT_Karang_Satria.csv](file:///sdcard/www/cek_dpt_gas/Template_DPS_DPT_Karang_Satria.csv)** — File CSV standar UTF-8 untuk opsi impor cepat.

---

## 📋 Struktur Data Google Sheets (Tab: `DPS_DPT_Karang_Satria`):

| Kolom | Nama Header | Tipe Data | Keterangan & Format | Contoh Data |
| :---: | :--- | :---: | :--- | :--- |
| **A** | `NIK (16 Digit)` | Teks | 16 Digit angka KTP *(diawali petik `'`)* | `'3216061408880001` |
| **B** | `Nama Lengkap Pemilih` | Teks | Nama lengkap sesuai KTP-el (Kapital) | `BUDI SANTOSO, S.KOM` |
| **C** | `Jenis Kelamin` | Teks | `Laki-laki` atau `Perempuan` | `Laki-laki` |
| **D** | `Tempat, Tanggal Lahir` | Teks | Kota dan tanggal kelahiran | `Bekasi, 14 Agustus 1988` |
| **E** | `Alamat Lengkap (RT/RW/Dusun)` | Teks | Alamat domisili di Karang Satria | `Perum Alamanda Regency Blok G3 No. 12, RT 004 / RW 018` |
| **F** | `Nomor TPS` | Teks | Alokasi nomor TPS pemilih | `TPS 014` |
| **G** | `Lokasi Fisik TPS` | Teks | Nama gedung / balai pertemuan / sekolah | `Balai Pertemuan Warga RW 018 Alamanda Regency` |
| **H** | `Status Pemilih (DPS/DPT)` | Teks | Status penetapan data pemilih | `DPT AKTIF` / `DPS TERVERIFIKASI` |
| **I** | `Kontak WA / Keterangan` | Teks | Nomor telepon / catatan desa | `081298765432` |
| **J** | `Waktu Registrasi` | Tanggal/Waktu | Waktu data dicatat sistem | `01/01/2026 08:00:00` |

---

## 📁 Struktur Berkas Proyek:
- **[Index.html](file:///sdcard/www/cek_dpt_gas/Index.html)** : Frontend Web App Mobile-First tema cerah ramah warga (Emerald Green & Gold).
- **[Code.gs](file:///sdcard/www/cek_dpt_gas/Code.gs)** : Backend Google Apps Script (Pencarian in-memory secepat kilat, REST API & Google Sheets sync).
- **[logo.png](file:///sdcard/www/cek_dpt_gas/logo.png)** : Logo resmi desa yang dimuat langsung via link GitHub raw.
- **[Template_DPS_DPT_Karang_Satria.xlsx](file:///sdcard/www/cek_dpt_gas/Template_DPS_DPT_Karang_Satria.xlsx)** : Berkas Excel resmi siap upload.
- **[Template_DPS_DPT_Karang_Satria.csv](file:///sdcard/www/cek_dpt_gas/Template_DPS_DPT_Karang_Satria.csv)** : Berkas CSV siap impor.
- **[README.md](file:///sdcard/www/cek_dpt_gas/README.md)** : Panduan & dokumentasi.

---

## 🚀 Panduan Penerapan di Google Apps Script (2 Menit):
1. Buka spreadsheet baru di [Google Sheets](https://sheets.new) atau buka file `Template_DPS_DPT_Karang_Satria.xlsx` di Google Sheets.
2. Klik menu **Ekstensi (Extensions)** > **Apps Script**.
3. Di editor Apps Script:
   - Salin isi dari `Code.gs` ke file `Code.gs`.
   - Klik tombol **`+`** > pilih **HTML** > beri nama **`Index`**, lalu salin isi dari `Index.html`.
4. Klik tombol **Terapkan (Deploy)** > **Penerapan Baru (New deployment)**.
5. Pilih jenis **Aplikasi Web (Web app)**:
   - **Jalankan sebagai (Execute as)**: *Saya (Me)*
   - **Siapa yang memiliki akses (Who has access)**: *Siapa saja (Anyone)*
6. Klik **Terapkan (Deploy)** dan bagikan URL Web App ke warga Desa Karang Satria.
