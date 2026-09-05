# 🗳️ Portal Resmi Cek DPS & DPT Online Pilkades Desa Karang Satria (2026 - 2034)
**Kecamatan Tambun Utara, Kabupaten Bekasi, Jawa Barat**

Mobile Web App modern & mewah berstandar portal resmi pemerintah untuk pengecekan Daftar Pemilih Sementara & Tetap (DPS/DPT), lokasi TPS, dan pencetakan KTP/Karcis Pemilih Digital berbasis Google Apps Script (GAS) dan Google Sheets gratis tanpa biaya server.

---

## 🏛️ Fitur Utama:
1. **Input NIK Mewah & Interaktif**:
   - Live 16-digit visual meter indicator & character counter.
   - Fitur Tempel (Paste) otomatis dari clipboard.
   - Pilihan sampel NIK warga Karang Satria sekali klik (Alamanda, Satria Mekar, Villa Indah Permai, Bumi Anggrek, Kp. Cerewet).
2. **Kartu Bukti Pemilih Digital (KTBP) Resmi**:
   - Kop resmi Pemkab Bekasi & Panitia Pilkades Desa Karang Satria Periode 2026 - 2034.
   - Kotak highlight nomor TPS & lokasi TPS terdaftar.
   - Sensor NIK privasi (dapat dibuka/ditutup).
   - Dynamic QR Code resmi untuk verifikasi kehadiran cepat oleh petugas KPPS.
   - Tombol Cetak Dokumen / Simpan PDF dan Kirim Bukti ke WhatsApp (Symmetrical 2-Column Grid).
3. **Data & Peta Sebaran TPS**:
   - Daftar 48 TPS se-Desa Karang Satria dengan filter pencarian real-time per RW/perumahan.
4. **Tahapan & Jadwal Pilkades 2026 - 2034**:
   - Informasi terstruktur alur penetapan DPS, masukan warga, penetapan DPT, hingga hari pemungutan suara.
5. **Layanan Lapor & Daftar DPS Mandiri**:
   - Form pengaduan bagi warga yang belum terdaftar langsung sync ke Google Sheet Panitia.
6. **MaoneArt Glassmorphism Modal System**:
   - Symmetrical 2-column modal (`showConfirmModal` / `showAlertModal`) sesuai standar design system.

---

## 📁 File Proyek:
- **[Index.html](file:///sdcard/www/cek_dpt_gas/Index.html)** : Frontend Web App Mobile-First berdesain mewah ala pemerintah (Navy & Gold).
- **[Code.gs](file:///sdcard/www/cek_dpt_gas/Code.gs)** : Backend Google Apps Script (In-memory search engine, auto-setup sheet, REST API & direct runner).

---

## 🚀 Panduan Pemasangan di Google Apps Script (2 Menit):
1. Buka spreadsheet baru di [Google Sheets](https://sheets.new) atau spreadsheet panitia.
2. Klik menu **Ekstensi (Extensions)** > **Apps Script**.
3. Di editor Apps Script:
   - Tempel isi dari `Code.gs` ke file `Code.gs`.
   - Klik tombol **`+`** > pilih **HTML** > beri nama **`Index`**, lalu tempel isi dari `Index.html`.
4. Klik **Terapkan (Deploy)** > **Penerapan Baru (New deployment)**.
5. Pilih jenis **Aplikasi Web (Web app)**:
   - **Jalankan sebagai (Execute as)**: *Saya (Me)*
   - **Siapa yang memiliki akses (Who has access)**: *Siapa saja (Anyone)*
6. Klik **Terapkan (Deploy)** dan salin URL Web App untuk disebarkan ke warga Desa Karang Satria.
