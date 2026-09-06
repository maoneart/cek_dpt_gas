# 🗳️ Portal Cek Lokasi TPS Pemilihan Kepala Desa Karang Satria (2026 - 2034)
**Kecamatan Tambun Utara, Kabupaten Bekasi, Jawa Barat**

Mobile Web App modern, cerah, segar, dan ramah warga (Tema Serba Orange & Judul Desa Hijau) yang fokus **100% langsung untuk pengecekan lokasi TPS warga berbasis NIK & Nama Lengkap dengan Algoritma Toleransi Typo (Fuzzy Matching)**. Menggunakan Google Sheets dengan arsitektur **95 Sheet TPS (TPS 1 s/d TPS 95)** sebagai database real-time dan Google Apps Script (GAS) sebagai backend gratis tanpa biaya server.

---

## 🏛️ Konsep & Alur Kerja:
1. Warga membuka Web App di HP (tampilan cerah, tulisan besar dan sangat mudah dibaca).
2. Warga memasukkan **Nomor NIK** (12 atau 16 digit) dan **Nama Lengkap** sesuai KTP.
3. Klik tombol **"CEK LOKASI TPS SAYA"**.
4. **Algoritma Fuzzy Matching Bekerja Otomatis**:
   - Jika ada sedikit perbedaan ejaan/typo huruf di KTP vs data Excel (contoh: *HERLABUNG* vs *HERLAMBANG*), sistem mendeteksi kemiripan $\ge 60\%$ dan **otomatis meloloskan data**.
   - Privasi terjaga 100% (tidak membocorkan nama warga lain yang tanggal lahir/NIK-nya serupa).
5. **Langsung Muncul Kartu Pemilih Digital Resmi**:
   - Nomor & Lokasi TPS tempat mencoblos.
   - Data Pemilih (NIK dengan sensor keamanan, Nama Lengkap, TTL & Gender, Alamat KTP, RT/RW).
   - Dynamic QR Code resmi untuk verifikasi presensi di TPS oleh panitia.
   - Tombol **Cetak / Simpan PDF** dan **Kirim ke WhatsApp**.
   - Tombol Navigasi Kembali / Cek NIK Warga Lainnya.

---

## 🔒 Mekanisme Sensor NIK & Keamanan Data (UU PDP):
- **Di Spreadsheet / Database**: NIK dapat diinput dengan format 12 angka + 4 bintang `****` (contoh: `'321606010101****` atau `'321606****010001'`), ataupun 16 digit penuh.
- **Pencarian Cerdas**:
  - Warga cukup memasukkan **12 digit NIK** + **Nama Lengkap**.
  - Jika warga memasukkan **16 digit NIK penuh**, sistem otomatis mencocokkan pola wildcard `****` dengan data di spreadsheet.

---

## 📊 File Template Excel Langsung Siap Pakai:
- **[Template_DPS_DPT_Karang_Satria.xlsx](file:///sdcard/www/cek_dpt_gas/Template_DPS_DPT_Karang_Satria.xlsx)** — File Excel Workbook (.xlsx) berisi **95 Sheet (`TPS 1` sampai `TPS 95`)** dengan header Orange, format kolom NKK & NIK text (`@`), siap langsung diisi data warga.
- **[Template_DPS_DPT_Karang_Satria.csv](file:///sdcard/www/cek_dpt_gas/Template_DPS_DPT_Karang_Satria.csv)** — File CSV standar UTF-8 dengan format 12 kolom resmi.

---

## 📋 Struktur Data per Sheet TPS (12 Kolom):

Setiap sheet bernama **`TPS 1`**, **`TPS 2`**, ... hingga **`TPS 95`** memiliki struktur kolom standar:

| Kolom | Nama Header | Tipe Data | Keterangan & Format | Contoh Data |
| :---: | :--- | :---: | :--- | :--- |
| **A** | `NO` | Angka | Nomor baris data | `1` |
| **B** | `NO URUT` | Teks / Angka | Nomor urut pemilih di TPS | `001` |
| **C** | `NO KK (NKK)` | Teks | Nomor Kartu Keluarga *(format teks)* | `'3216060101010001` |
| **D** | `NIK (16 Digit)` | Teks | 12 Digit Angka + 4 Sensor Bintang `****` *(atau 16 Digit)* | `'321606010101****` |
| **E** | `NAMA LENGKAP` | Teks | Nama lengkap sesuai KTP-el (Kapital) | `BUDI SANTOSO, S.KOM` |
| **F** | `JENIS KELAMIN` | Teks | `Laki-laki` / `Perempuan` (atau `L` / `P`) | `Laki-laki` |
| **G** | `TEMPAT LAHIR` | Teks | Kota / Kabupaten tempat lahir | `Bekasi` |
| **H** | `TANGGAL LAHIR` | Teks | Tanggal lahir pemilih | `14 Agustus 1988` |
| **I** | `ALAMAT` | Teks | Alamat jalan / perumahan / blok / dusun | `Perum Alamanda Regency Blok G3 No. 12` |
| **J** | `RT` | Teks | Nomor RT domisili | `004` |
| **K** | `RW` | Teks | Nomor RW domisili | `018` |
| **L** | `KETERANGAN` | Teks | Status pemilih / catatan TPS | `DPT AKTIF` |

---

## 📁 Struktur Berkas Proyek:
- **[Index.html](file:///sdcard/www/cek_dpt_gas/Index.html)** : Frontend Web App Mobile-First tema cerah ramah warga (Orange Theme & Green Title).
- **[Code.gs](file:///sdcard/www/cek_dpt_gas/Code.gs)** : Backend Google Apps Script (Multi-Sheet Scanner 95 TPS, Smart Fuzzy Name Matcher, REST API, & Caching).
- **[logo.png](file:///sdcard/www/cek_dpt_gas/logo.png)** : Logo resmi Pemdes yang dimuat langsung via GitHub raw link.
- **[kpu.png](file:///sdcard/www/cek_dpt_gas/kpu.png)** : Logo resmi KPU yang dimuat langsung via GitHub raw link.
- **[Template_DPS_DPT_Karang_Satria.xlsx](file:///sdcard/www/cek_dpt_gas/Template_DPS_DPT_Karang_Satria.xlsx)** : Berkas Excel resmi 95 sheet TPS siap pakai.
- **[Template_DPS_DPT_Karang_Satria.csv](file:///sdcard/www/cek_dpt_gas/Template_DPS_DPT_Karang_Satria.csv)** : Berkas CSV format 12 kolom siap impor.
- **[README.md](file:///sdcard/www/cek_dpt_gas/README.md)** : Panduan & dokumentasi lengkap.

---

## 🚀 Panduan Penerapan di Google Apps Script:
1. Buka spreadsheet baru di [Google Sheets](https://sheets.new) atau unggah file `Template_DPS_DPT_Karang_Satria.xlsx` ke Google Drive lalu buka dengan Google Sheets.
2. Klik menu **Ekstensi (Extensions)** > **Apps Script**.
3. Di editor Apps Script:
   - Salin isi dari `Code.gs` ke file `Code.gs`.
   - Klik tombol **`+`** > pilih **HTML** > beri nama **`Index`**, lalu salin isi dari `Index.html`.
4. *(Opsional)* Di spreadsheet, klik menu **🗳️ Pilkades Karang Satria** > **🛠️ Setup Otomatis 95 Sheet TPS (TPS 1 - 95)** untuk men-generate seluruh 95 sheet beserta header secara otomatis jika memulai dari spreadsheet kosong.
5. Klik tombol **Terapkan (Deploy)** > **Penerapan Baru (New deployment)**.
6. Pilih jenis **Aplikasi Web (Web app)**:
   - **Jalankan sebagai (Execute as)**: *Saya (Me)*
   - **Siapa yang memiliki akses (Who has access)**: *Siapa saja (Anyone)*
7. Klik **Terapkan (Deploy)** dan bagikan URL Web App ke warga Desa Karang Satria.
