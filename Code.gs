/**
 * 🗳️ PORTAL RESMI CEK LOKASI TPS WARGA
 * PEMILIHAN KEPALA DESA KARANG SATRIA (PERIODE 2026 - 2034)
 * Kecamatan Tambun Utara, Kabupaten Bekasi, Jawa Barat
 * Backend Engine: Google Apps Script + Google Sheets Real-Time Database
 */

// Konfigurasi Nama Sheet Database
const SHEET_NAME = 'DPS_DPT_Karang_Satria';

/**
 * 1. Entry Point Web App (doGet)
 */
function doGet(e) {
  // Jika dipanggil via REST API (contoh: ?nik=3216061408880001)
  if (e && e.parameter && e.parameter.nik) {
    const result = searchByNIK(e.parameter.nik);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Tampilkan Halaman Web App Cek TPS
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Cek TPS Pemilihan Kepala Desa Karang Satria 2026 - 2034')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 2. REST API Handler (doPost)
 */
function doPost(e) {
  try {
    const contents = e.postData ? JSON.parse(e.postData.contents) : e.parameter;
    const action = contents.action || 'search';

    if (action === 'search') {
      const result = searchByNIK(contents.nik);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'add') {
      const result = addWarga(contents);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Aksi tidak dikenal' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 3. Fungsi Pencarian NIK (In-Memory Fast Array Cache)
 */
function searchByNIK(nikInput) {
  if (!nikInput) {
    return { status: 'error', message: 'Silakan masukkan 16 digit NIK Anda.' };
  }

  const cleanNIK = nikInput.toString().replace(/[^0-9]/g, '').trim();
  if (cleanNIK.length !== 16) {
    return { status: 'error', message: 'NIK tidak valid (harus 16 digit angka).' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }

  const data = sheet.getDataRange().getDisplayValues();
  if (data.length <= 1) {
    return { status: 'not_found', message: 'Database DPS/DPT Desa Karang Satria belum memiliki data pemilih.' };
  }

  // Header indexing otomatis
  const headers = data[0].map(h => h.toString().toLowerCase().trim());
  let idxNik = headers.findIndex(h => h.includes('nik'));
  let idxNama = headers.findIndex(h => h.includes('nama'));
  let idxGender = headers.findIndex(h => h.includes('gender') || h.includes('kelamin') || h.includes('jk'));
  let idxTTL = headers.findIndex(h => h.includes('lahir') || h.includes('ttl'));
  let idxAlamat = headers.findIndex(h => h.includes('alamat') || h.includes('rt') || h.includes('rw') || h.includes('domisili'));
  let idxTPS = headers.findIndex(h => h.includes('tps') && !h.includes('lokasi'));
  let idxTPSLokasi = headers.findIndex(h => h.includes('lokasi') || h.includes('tempat'));
  let idxStatus = headers.findIndex(h => h.includes('status') || h.includes('dpt') || h.includes('dps'));
  let idxKet = headers.findIndex(h => h.includes('ket') || h.includes('catatan') || h.includes('wa'));

  if (idxNik === -1) idxNik = 0;
  if (idxNama === -1) idxNama = 1;
  if (idxGender === -1) idxGender = 2;
  if (idxTTL === -1) idxTTL = 3;
  if (idxAlamat === -1) idxAlamat = 4;
  if (idxTPS === -1) idxTPS = 5;
  if (idxTPSLokasi === -1) idxTPSLokasi = 6;
  if (idxStatus === -1) idxStatus = 7;
  if (idxKet === -1) idxKet = 8;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowNIK = row[idxNik] ? row[idxNik].toString().replace(/[^0-9]/g, '').trim() : '';

    if (rowNIK === cleanNIK) {
      const maskedNIK = cleanNIK.length === 16 
        ? cleanNIK.substring(0, 6) + '******' + cleanNIK.substring(12) 
        : cleanNIK;

      return {
        status: 'success',
        data: {
          nik: cleanNIK,
          nikMasked: maskedNIK,
          nama: row[idxNama] ? row[idxNama].toString().trim().toUpperCase() : '-',
          gender: (idxGender !== -1 && row[idxGender]) ? row[idxGender].toString().trim() : 'Laki-laki / Perempuan',
          ttl: (idxTTL !== -1 && row[idxTTL]) ? row[idxTTL].toString().trim() : '-',
          alamat: (idxAlamat !== -1 && row[idxAlamat]) ? row[idxAlamat].toString().trim() : 'Desa Karang Satria, Kec. Tambun Utara',
          tps: (idxTPS !== -1 && row[idxTPS]) ? row[idxTPS].toString().trim() : 'TPS Belum Ditentukan',
          tpsLokasi: (idxTPSLokasi !== -1 && row[idxTPSLokasi]) ? row[idxTPSLokasi].toString().trim() : 'Lokasi TPS Resmi Desa Karang Satria',
          status: (idxStatus !== -1 && row[idxStatus]) ? row[idxStatus].toString().trim() : 'DPT AKTIF',
          keterangan: (idxKet !== -1 && row[idxKet]) ? row[idxKet].toString().trim() : 'Terdaftar Tetap'
        }
      };
    }
  }

  return {
    status: 'not_found',
    message: 'NIK ' + cleanNIK + ' belum terdaftar dalam database DPS/DPT Pemilihan Kepala Desa Karang Satria 2026-2034. Pastikan nomor NIK sudah benar atau hubungi petugas desa.'
  };
}

/**
 * 4. Fungsi Tambah Data Warga Baru ke Google Sheet
 */
function addWarga(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = setupSpreadsheet();
    }

    const nik = data.nik ? data.nik.toString().replace(/[^0-9]/g, '').trim() : '';
    const nama = (data.nama || '').trim().toUpperCase();
    const gender = (data.gender || '-').trim();
    const ttl = (data.ttl || '').trim();
    const alamat = (data.alamat || '').trim();
    const tps = (data.tps || '').trim();
    const tpsLokasi = (data.tpsLokasi || 'Sesuai Penetapan Desa').trim();
    const status = (data.status || 'DPT AKTIF').trim();
    const noWA = (data.noWA || data.keterangan || '-').trim();

    if (!nik || !nama) {
      return { status: 'error', message: 'NIK dan Nama Pemilih wajib diisi lengkap!' };
    }

    if (nik.length !== 16) {
      return { status: 'error', message: 'NIK harus berjumlah 16 digit angka.' };
    }

    // Cek duplikasi NIK
    const existing = searchByNIK(nik);
    if (existing.status === 'success') {
      return { status: 'error', message: 'NIK ' + nik + ' sudah terdaftar atas nama: ' + existing.data.nama + ' di ' + existing.data.tps };
    }

    sheet.appendRow([
      "'" + nik,
      nama,
      gender,
      ttl,
      alamat,
      tps,
      tpsLokasi,
      status,
      noWA,
      new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    ]);

    return {
      status: 'success',
      message: 'Data warga berhasil dicatat ke Google Sheet!',
      data: { nik: nik, nama: nama, tps: tps }
    };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * 5. Inisialisasi Otomatis Format Sheet Hijau & Emas Segar
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    const headers = [
      [
        'NIK (16 Digit)', 
        'Nama Lengkap Pemilih', 
        'Jenis Kelamin', 
        'Tempat, Tanggal Lahir', 
        'Alamat Lengkap (RT/RW/Dusun)', 
        'Nomor TPS', 
        'Lokasi Fisik TPS', 
        'Status Pemilih (DPS/DPT)', 
        'Kontak WA / Keterangan',
        'Waktu Registrasi'
      ]
    ];
    
    // Header Style Hijau Zamrud Desa & Kuning Emas
    sheet.getRange(1, 1, 1, 10).setValues(headers)
      .setBackground('#047857')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setFontFamily('Arial')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    sheet.setRowHeight(1, 36);
    sheet.getRange("A:A").setNumberFormat("@");
    sheet.autoResizeColumns(1, 10);
  }

  return sheet;
}

/**
 * 6. Custom Menu di Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🗳️ Pilkades Karang Satria')
    .addItem('🛠️ Setup Format Database & Header', 'setupSpreadsheet')
    .addItem('🔍 Uji Cari NIK Warga', 'testCariNIK')
    .addToUi();
}

function testCariNIK() {
  const ui = SpreadsheetApp.getUi();
  const prompt = ui.prompt('Cari Data Pemilih Pilkades Karang Satria', 'Masukkan 16 Digit NIK yang ingin diuji:', ui.ButtonSet.OK_CANCEL);
  if (prompt.getSelectedButton() === ui.Button.OK) {
    const res = searchByNIK(prompt.getResponseText());
    if (res.status === 'success') {
      ui.alert('DATA DITEMUKAN! 🎉', 
        'Nama: ' + res.data.nama + '\n' +
        'TPS: ' + res.data.tps + ' (' + res.data.tpsLokasi + ')\n' +
        'Alamat: ' + res.data.alamat + '\n' +
        'Status: ' + res.data.status, 
        ui.ButtonSet.OK
      );
    } else {
      ui.alert('HASIL PENCARIAN', res.message, ui.ButtonSet.OK);
    }
  }
}
