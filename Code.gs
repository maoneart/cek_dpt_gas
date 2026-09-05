/**
 * 🗳️ PORTAL RESMI CEK LOKASI TPS WARGA
 * PEMILIHAN KEPALA DESA KARANG SATRIA (PERIODE 2026 - 2034)
 * Kecamatan Tambun Utara, Kabupaten Bekasi, Jawa Barat
 * Backend Engine: Multi-Sheet Support (95 TPS: TPS 1 s/d TPS 95) + Google Apps Script
 */

// Konfigurasi Header Standar per TPS (12 Kolom)
const OFFICIAL_HEADERS = [
  'NO',
  'NO URUT',
  'NO KK (NKK)',
  'NIK (16 Digit)',
  'NAMA LENGKAP',
  'JENIS KELAMIN',
  'TEMPAT LAHIR',
  'TANGGAL LAHIR',
  'ALAMAT',
  'RT',
  'RW',
  'KETERANGAN'
];

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
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Aksi tidak dikenal' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 3. Fungsi Pencarian NIK Lintas 95 Sheet TPS (Mendukung 12 Digit Angka & 4 Bintang Sensor)
 */
function searchByNIK(nikInput) {
  if (!nikInput) {
    return { status: 'error', message: 'Silakan masukkan NIK Anda (12 atau 16 digit).' };
  }

  const cleanNIK = nikInput.toString().replace(/[^0-9]/g, '').trim();
  if (cleanNIK.length < 12 || cleanNIK.length > 16) {
    return { status: 'error', message: 'NIK tidak valid (minimal 12 digit dan maksimal 16 digit angka).' };
  }

  // Cek Fast Cache Memory
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('DPT_NIK_' + cleanNIK);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  if (!sheets || sheets.length === 0) {
    return { status: 'not_found', message: 'Spreadsheet belum memiliki sheet TPS.' };
  }

  // Telusuri seluruh sheet (TPS 1 s/d TPS 95)
  for (let s = 0; s < sheets.length; s++) {
    const sheet = sheets[s];
    const sheetName = sheet.getName().trim();
    
    // Ambil seluruh data sheet sekaligus (in-memory fast read)
    const data = sheet.getDataRange().getDisplayValues();
    if (!data || data.length <= 1) continue;

    // Deteksi index kolom secara dinamis
    const headers = data[0].map(h => h.toString().toLowerCase().trim());
    let idxNIK = headers.findIndex(h => h === 'nik' || h.includes('nik'));
    let idxNKK = headers.findIndex(h => h === 'nkk' || h.includes('kk') || h.includes('keluarga'));
    let idxNama = headers.findIndex(h => h.includes('nama'));
    let idxGender = headers.findIndex(h => h.includes('kelamin') || h.includes('gender') || h === 'jk');
    let idxTempatLahir = headers.findIndex(h => h.includes('tempat'));
    let idxTglLahir = headers.findIndex(h => h.includes('tanggal') || h.includes('tgl') || (h.includes('lahir') && idxTempatLahir !== -1));
    let idxAlamat = headers.findIndex(h => h.includes('alamat') || h.includes('jalan') || h.includes('blok') || h.includes('dusun'));
    let idxRT = headers.findIndex(h => h === 'rt' || h.includes('rt'));
    let idxRW = headers.findIndex(h => h === 'rw' || h.includes('rw'));
    let idxNoUrut = headers.findIndex(h => h.includes('urut') || h === 'no');
    let idxKet = headers.findIndex(h => h.includes('ket') || h.includes('catatan') || h.includes('status'));

    // Default Fallback index posisi jika header kustom
    if (idxNIK === -1) idxNIK = 3; // Kolom D
    if (idxNama === -1) idxNama = 4; // Kolom E
    if (idxGender === -1) idxGender = 5; // Kolom F
    if (idxTempatLahir === -1) idxTempatLahir = 6; // Kolom G
    if (idxTglLahir === -1) idxTglLahir = 7; // Kolom H
    if (idxAlamat === -1) idxAlamat = 8; // Kolom I
    if (idxRT === -1) idxRT = 9; // Kolom J
    if (idxRW === -1) idxRW = 10; // Kolom K
    if (idxKet === -1) idxKet = 11; // Kolom L

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const rowNIKVal = row[idxNIK] ? row[idxNIK].toString().trim() : '';

      if (isNikMatch(rowNIKVal, cleanNIK)) {
        // Format Nama TPS
        const tpsName = sheetName.toUpperCase();

        // Format Gender
        let genderStr = (idxGender !== -1 && row[idxGender]) ? row[idxGender].toString().trim() : '';
        if (genderStr.toUpperCase() === 'L') genderStr = 'Laki-laki';
        else if (genderStr.toUpperCase() === 'P') genderStr = 'Perempuan';

        // Format TTL
        const tempat = (idxTempatLahir !== -1 && row[idxTempatLahir]) ? row[idxTempatLahir].toString().trim() : '';
        const tgl = (idxTglLahir !== -1 && row[idxTglLahir]) ? row[idxTglLahir].toString().trim() : '';
        let ttlStr = '-';
        if (tempat && tgl) ttlStr = tempat + ', ' + tgl;
        else if (tempat) ttlStr = tempat;
        else if (tgl) ttlStr = tgl;

        // Format Alamat Lengkap
        const alamatRaw = (idxAlamat !== -1 && row[idxAlamat]) ? row[idxAlamat].toString().trim() : '';
        const rt = (idxRT !== -1 && row[idxRT]) ? row[idxRT].toString().trim() : '';
        const rw = (idxRW !== -1 && row[idxRW]) ? row[idxRW].toString().trim() : '';

        let alamatFull = alamatRaw;
        if (rt || rw) {
          const rtrw = 'RT ' + (rt || '-') + ' / RW ' + (rw || '-');
          if (alamatFull && !alamatFull.includes('RT')) {
            alamatFull += ', ' + rtrw;
          } else if (!alamatFull) {
            alamatFull = rtrw;
          }
        }
        if (alamatFull && !alamatFull.toLowerCase().includes('karang satria')) {
          alamatFull += ', Desa Karang Satria';
        }

        // Masking NIK untuk privasi tampilan
        let maskedNIK = rowNIKVal || cleanNIK;
        if (!maskedNIK.includes('*')) {
          if (maskedNIK.length === 16) {
            maskedNIK = maskedNIK.substring(0, 6) + '****' + maskedNIK.substring(10);
          } else if (maskedNIK.length === 12) {
            maskedNIK = maskedNIK + '****';
          }
        }

        const result = {
          status: 'success',
          data: {
            nik: cleanNIK,
            nikRaw: rowNIKVal || cleanNIK,
            nikMasked: maskedNIK,
            nkk: (idxNKK !== -1 && row[idxNKK]) ? row[idxNKK].toString().trim() : '',
            nama: (idxNama !== -1 && row[idxNama]) ? row[idxNama].toString().trim().toUpperCase() : 'WARGA DESA KARANG SATRIA',
            gender: genderStr || 'Laki-laki / Perempuan',
            ttl: ttlStr,
            alamat: alamatFull || 'Desa Karang Satria, Kec. Tambun Utara',
            rt: rt,
            rw: rw,
            noUrut: (idxNoUrut !== -1 && row[idxNoUrut]) ? row[idxNoUrut].toString().trim() : '',
            tps: tpsName,
            tpsLokasi: 'Lokasi Pemungutan Suara ' + tpsName + ' Desa Karang Satria',
            status: (idxKet !== -1 && row[idxKet] && row[idxKet].trim()) ? row[idxKet].toString().trim() : 'DPT AKTIF'
          }
        };

        // Simpan di Cache Script selama 6 Jam
        try {
          CacheService.getScriptCache().put('DPT_NIK_' + cleanNIK, JSON.stringify(result), 21600);
        } catch (e) {}

        return result;
      }
    }
  }

  return {
    status: 'not_found',
    message: 'NIK ' + cleanNIK + ' belum terdaftar dalam database DPS/DPT (95 TPS) Pemilihan Kepala Desa Karang Satria 2026-2034. Pastikan nomor NIK sudah benar atau hubungi panitia desa.'
  };
}

/**
 * Helper Fungsi Pencocokan NIK (Mendukung 12 Digit, 16 Digit & Wildcard 4 Bintang ****)
 */
function isNikMatch(rowVal, cleanQuery) {
  if (!rowVal || !cleanQuery) return false;
  
  const rawStr = rowVal.toString().trim();
  const rowDigits = rawStr.replace(/[^0-9]/g, '');
  
  // 1. Kesamaan angka murni langsung
  if (rowDigits === cleanQuery) return true;
  
  // 2. Jika input user 12 digit angka
  if (cleanQuery.length === 12) {
    if (rowDigits === cleanQuery) return true;
    if (rowDigits.startsWith(cleanQuery)) return true;
    // Cek jika di sheet 16 digit angka penuh, cocokkan 12 digit (6 depan + 6 belakang)
    if (rowDigits.length === 16 && (rowDigits.substring(0, 6) + rowDigits.substring(10)) === cleanQuery) return true;
  }
  
  // 3. Jika input user 16 digit dan data sheet memiliki bintang (wildcard 4 digit ****)
  if (cleanQuery.length === 16) {
    if (rawStr.includes('*') || rawStr.toLowerCase().includes('x')) {
      try {
        const pattern = '^' + rawStr.replace(/[^0-9*xX]/g, '').replace(/[*xX]/g, '\\d') + '$';
        const regex = new RegExp(pattern);
        if (regex.test(cleanQuery)) return true;
      } catch (e) {}
    }
    // Jika di sheet hanya ada 12 digit angka, cek kecocokan 12 digit
    if (rowDigits.length === 12 && cleanQuery.startsWith(rowDigits)) return true;
    if (rowDigits.length === 12 && (cleanQuery.substring(0, 6) + cleanQuery.substring(10)) === rowDigits) return true;
  }
  
  // 4. Wildcard matching karakter per karakter jika rawStr mengandung bintang
  if (rawStr.includes('*')) {
    const cleanPattern = rawStr.replace(/[^0-9*]/g, '');
    if (cleanPattern.length === cleanQuery.length) {
      let match = true;
      for (let i = 0; i < cleanPattern.length; i++) {
        if (cleanPattern[i] !== '*' && cleanPattern[i] !== cleanQuery[i]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
  }

  return false;
}

/**
 * 4. Setup Format Otomatis 95 Sheet TPS (TPS 1 s/d TPS 95)
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Format Header Style Orange Tema Desa
  const headerData = [OFFICIAL_HEADERS];
  
  for (let i = 1; i <= 95; i++) {
    const sheetName = 'TPS ' + i;
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length).setValues(headerData)
        .setBackground('#EA580C')
        .setFontColor('#FFFFFF')
        .setFontWeight('bold')
        .setFontFamily('Arial')
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');

      sheet.setRowHeight(1, 32);
      
      // Format Kolom C (NKK) dan Kolom D (NIK) sebagai Text
      sheet.getRange("C:C").setNumberFormat("@");
      sheet.getRange("D:D").setNumberFormat("@");
      sheet.autoResizeColumns(1, OFFICIAL_HEADERS.length);
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('95 Sheet TPS berhasil disiapkan!', 'Setup Berhasil', 5);
}

/**
 * 5. Bersihkan Cache Pencarian NIK
 */
function clearSearchCache() {
  try {
    CacheService.getScriptCache().removeAll(['DPT_NIK_']);
    SpreadsheetApp.getActiveSpreadsheet().toast('Cache pencarian berhasil dibersihkan.', 'Cache Refresh', 4);
  } catch (e) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Cache telah direfresh.', 'Info', 3);
  }
}

/**
 * 6. Custom Menu di Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🗳️ Pilkades Karang Satria')
    .addItem('🛠️ Setup Otomatis 95 Sheet TPS (TPS 1 - 95)', 'setupSpreadsheet')
    .addItem('🔍 Uji Cari NIK Warga (Lintas 95 TPS)', 'testCariNIK')
    .addItem('🔄 Refresh / Bersihkan Cache Pencarian', 'clearSearchCache')
    .addToUi();
}

function testCariNIK() {
  const ui = SpreadsheetApp.getUi();
  const prompt = ui.prompt('Cari Data Pemilih Pilkades (95 TPS)', 'Masukkan 12 atau 16 Digit NIK yang ingin diuji:', ui.ButtonSet.OK_CANCEL);
  if (prompt.getSelectedButton() === ui.Button.OK) {
    const res = searchByNIK(prompt.getResponseText());
    if (res.status === 'success') {
      ui.alert('DATA DITEMUKAN! 🎉', 
        'Nama: ' + res.data.nama + '\n' +
        'TPS: ' + res.data.tps + '\n' +
        'Alamat: ' + res.data.alamat + '\n' +
        'TTL: ' + res.data.ttl + ' (' + res.data.gender + ')\n' +
        'Status: ' + res.data.status, 
        ui.ButtonSet.OK
      );
    } else {
      ui.alert('HASIL PENCARIAN', res.message, ui.ButtonSet.OK);
    }
  }
}
