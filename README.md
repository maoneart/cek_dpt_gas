# 🗳️ Portal Resmi Cek DPS & DPT Online Pilkades Desa Karang Satria (2026 - 2034)
**Kecamatan Tambun Utara, Kabupaten Bekasi, Jawa Barat**

Mobile Web App modern & mewah berstandar portal resmi pemerintah (Presidential Navy & Royal Gold) untuk pengecekan Daftar Pemilih Sementara & Tetap (DPS/DPT), lokasi TPS, dan pencetakan Kartu Tanda Bukti Terdaftar Pemilih (KTBP) Digital berbasis Google Apps Script (GAS) dan Google Sheets gratis tanpa biaya server.

---

## 🏛️ Fitur Utama Sistem:
1. **Input NIK Mewah & Interaktif**:
   - Visual Meter 16 Digit interaktif (*live indicator & progress pills*).
   - Fitur Tempel (*Paste*) otomatis dari papan klip.
   - Pilihan sampel NIK warga Desa Karang Satria sekali klik (Alamanda, Satria Mekar, VIP, Bumi Anggrek, Kp. Cerewet).
2. **Kartu Bukti Pemilih Digital (KTBP) Resmi**:
   - Kop resmi Pemerintah Kabupaten Bekasi & Panitia Pilkades Desa Karang Satria Masa Jabatan 2026 – 2034.
   - Kotak *hero highlight* nomor TPS & lokasi TPS terdaftar.
   - Fitur buka/tutup sensor NIK demi privasi data kependudukan.
   - Dynamic QR Code resmi untuk verifikasi kehadiran cepat oleh petugas KPPS di TPS.
   - Tombol Aksi 2 Kolom Simetris: Cetak Dokumen / Simpan PDF dan Kirim Bukti ke WhatsApp.
3. **Data & Peta Sebaran TPS**:
   - Daftar 48 sebaran TPS se-Desa Karang Satria dengan filter pencarian instan per RW/perumahan.
4. **Tahapan & Jadwal Pilkades 2026 – 2034**:
   - Timeline agenda resmi pemutakhiran DPS, tanggapan masyarakat, penetapan DPT, hingga hari pencoblosan.
5. **Layanan Lapor & Daftar DPS Mandiri**:
   - Form pengaduan bagi warga yang belum terdaftar langsung tersimpan ke Google Sheet Panitia.
6. **MaoneArt Glassmorphism Modal System**:
   - Modal interaktif standar (`showConfirmModal` & `showAlertModal`) dengan layout tombol simetris 2 kolom (`grid grid-cols-2 gap-3`).

---

## 📊 Struktur Data Google Sheets (Tab: `DPS_DPT_Karang_Satria`)

Database menggunakan 1 Sheet/Tab bernama **`DPS_DPT_Karang_Satria`** dengan **10 kolom** standar resmi:

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
| **I** | `Kontak WA / Keterangan` | Teks | Nomor telepon / catatan panitia | `081298765432` |
| **J** | `Waktu Registrasi` | Tanggal/Waktu | Waktu data dicatat sistem | `01/01/2026 08:00:00` |

---

## 💡 Contoh Sampel Data Warga Bawaan:

| NIK | Nama Pemilih | Lokasi Alamat | TPS | Lokasi TPS | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| `3216061408880001` | BUDI SANTOSO, S.KOM | Perum Alamanda Regency RT 004 / RW 018 | **TPS 014** | Balai Warga RW 018 Alamanda | `DPT AKTIF` |
| `3216062005920002` | SITI NURHALIZA, M.PD | Kp. Cerewet RT 002 / RW 007 | **TPS 006** | Halaman SDN Karang Satria 01 | `DPT AKTIF` |
| `3216061011950003` | AHMAD FAUZI PRATAMA | Villa Indah Permai Blok B2 RT 005 / RW 022 | **TPS 022** | GSG RW 022 VIP | `DPS TERVERIFIKASI` |
| `3216060501900004` | DEWI ANGGRAENI, S.E | Bumi Anggrek Blok D1 RT 001 / RW 015 | **TPS 011** | Pos Balai RW 015 Bumi Anggrek | `DPT AKTIF` |

---

## 📁 Struktur Berkas Proyek:
- **[Index.html](file:///sdcard/www/cek_dpt_gas/Index.html)** : Frontend Web App Mobile-First bertema portal resmi pemerintah (Presidential Navy & Royal Gold).
- **[Code.gs](file:///sdcard/www/cek_dpt_gas/Code.gs)** : Backend Google Apps Script (Fast in-memory array search, auto-setup sheet, REST API & serverless runner).
- **[README.md](file:///sdcard/www/cek_dpt_gas/README.md)** : Dokumentasi arsitektur database dan panduan deployment.

---

## 🚀 Panduan Penerapan di Google Apps Script (2 Menit):
1. Buka spreadsheet di [Google Sheets](https://sheets.new).
2. Klik menu **Ekstensi (Extensions)** > **Apps Script**.
3. Di editor Google Apps Script:
   - Tempel isi dari `Code.gs` ke file `Code.gs`.
   - Klik tombol **`+`** > pilih **HTML** > beri nama **`Index`**, lalu tempel isi dari `Index.html`.
4. Klik menu **`🗳️ Panitia Pilkades Karang Satria`** > **`🛠️ Setup Format Database & Header`** di Spreadsheet untuk membuat struktur kolom & data sampel otomatis.
5. Klik tombol **Terapkan (Deploy)** > **Penerapan Baru (New deployment)**.
6. Pilih jenis **Aplikasi Web (Web app)**:
   - **Jalankan sebagai (Execute as)**: *Saya (Me)*
   - **Siapa yang memiliki akses (Who has access)**: *Siapa saja (Anyone)*
7. Klik **Terapkan (Deploy)** dan salin URL Web App untuk disebarkan ke warga Desa Karang Satria.
