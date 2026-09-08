/**
 * 🗳️ PORTAL RESMI CEK LOKASI TPS WARGA
 * PEMILIHAN KEPALA DESA KARANG SATRIA (PERIODE 2026 - 2034)
 * Kecamatan Tambun Utara, Kabupaten Bekasi, Jawa Barat
 * Backend Engine: Multi-Sheet Support (95 TPS: TPS 1 s/d TPS 95) + Google Apps Script
 * Update: Pencarian Tepat 12 Digit NIK (Format Database: 321605600301****)
 */

// Konfigurasi Header Standar per TPS (12 Kolom)
const OFFICIAL_HEADERS = [
  'NO',              // 0: A
  'NO URUT',         // 1: B
  'NO KK (NKK)',     // 2: C
  'NIK (16 Digit)',  // 3: D
  'NAMA LENGKAP',    // 4: E
  'JENIS KELAMIN',   // 5: F
  'TEMPAT LAHIR',    // 6: G
  'TANGGAL LAHIR',   // 7: H
  'ALAMAT',          // 8: I
  'RT',              // 9: J
  'RW',              // 10: K
  'KETERANGAN'       // 11: L
];

/**
 * 1. Entry Point Web App (doGet)
 */
function doGet(e) {
  // Jika dipanggil via REST API (contoh: ?nik=321605600301)
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
 * 3. Fungsi Pencarian 12 Digit NIK Lintas 95 Sheet TPS
 * Mencocokkan 12 digit NIK input dengan format database Kolom D (misal: 321605600301****)
 */
function searchByNIK(nikInput) {
  if (!nikInput) {
    return { status: 'error', message: 'Silakan masukkan 12 digit NIK KTP Anda.' };
  }

  const cleanNIK = nikInput.toString().replace(/[^0-9]/g, '').trim();
  if (cleanNIK.length < 12) {
    return { status: 'error', message: 'Nomor Induk Kependudukan (NIK) minimal 12 digit angka.' };
  }

  const query12 = cleanNIK.substring(0, 12);

  // Cek Fast Cache Memory
  const cacheKey = 'DPT_NIK_12_' + query12;
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  if (!sheets || sheets.length === 0) {
    return { status: 'not_found', message: 'Spreadsheet belum memiliki sheet TPS.' };
  }

  const matches = [];

  // Pindai seluruh sheet (TPS 1 s/d TPS 95)
  for (let s = 0; s < sheets.length; s++) {
    const sheet = sheets[s];
    const sheetName = sheet.getName().trim();
    
    // In-memory fast read
    const data = sheet.getDataRange().getDisplayValues();
    if (!data || data.length <= 1) continue;

    // Deteksi index kolom secara dinamis & akurat
    const headers = data[0].map(h => h.toString().toLowerCase().trim());
    let idxNo = headers.findIndex(h => h === 'no' || h === 'nomor');
    let idxNoUrut = headers.findIndex(h => h.includes('urut'));
    let idxNKK = headers.findIndex(h => h.includes('nkk') || h.includes('kk') || h.includes('keluarga'));
    let idxNIK = headers.findIndex(h => h.includes('nik'));
    let idxNama = headers.findIndex(h => h.includes('nama'));
    let idxGender = headers.findIndex(h => h.includes('kelamin') || h.includes('gender') || h === 'jk');
    let idxTempatLahir = headers.findIndex(h => h.includes('tempat') || h.includes('tmpt') || h === 'tpt lahir');
    let idxTglLahir = headers.findIndex(h => h.includes('tanggal') || h.includes('tgl') || (h.includes('lahir') && !h.includes('tempat') && !h.includes('tmpt')));
    let idxAlamat = headers.findIndex(h => h.includes('alamat') || h.includes('jalan') || h.includes('blok') || h.includes('dusun'));
    let idxRT = headers.findIndex(h => h === 'rt' || h.includes('rt'));
    let idxRW = headers.findIndex(h => h === 'rw' || h.includes('rw'));
    let idxKet = headers.findIndex(h => h.includes('ket') || h.includes('catatan') || h.includes('status'));

    // Default Fallback index posisi Kolom A-L: 0-11
    if (idxNoUrut === -1) idxNoUrut = 1;      // Kolom B (No Urut)
    if (idxNKK === -1) idxNKK = 2;            // Kolom C (NKK)
    if (idxNIK === -1) idxNIK = 3;            // Kolom D (NIK 12 digit + ****)
    if (idxNama === -1) idxNama = 4;          // Kolom E (Nama Lengkap)
    if (idxGender === -1) idxGender = 5;      // Kolom F (Jenis Kelamin)
    if (idxTempatLahir === -1) idxTempatLahir = 6; // Kolom G (Tempat Lahir)
    if (idxTglLahir === -1) idxTglLahir = 7;  // Kolom H (Tanggal Lahir)
    if (idxAlamat === -1) idxAlamat = 8;      // Kolom I (Alamat)
    if (idxRT === -1) idxRT = 9;              // Kolom J (RT)
    if (idxRW === -1) idxRW = 10;             // Kolom K (RW)
    if (idxKet === -1) idxKet = 11;           // Kolom L (Keterangan)

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const rowNIKVal = row[idxNIK] ? row[idxNIK].toString().trim() : '';

      // Cocokkan apakah 12 digit NIK input persis sama dengan NIK di database
      if (isNikMatch(rowNIKVal, query12)) {
        const tpsName = sheetName.toUpperCase();

        // 1. Format Jenis Kelamin (Kolom F)
        let genderStr = (idxGender !== -1 && row[idxGender]) ? row[idxGender].toString().trim() : '';
        if (genderStr.toUpperCase() === 'L' || genderStr.toLowerCase().startsWith('l') || genderStr.toLowerCase().includes('laki')) {
          genderStr = 'Laki-laki';
        } else if (genderStr.toUpperCase() === 'P' || genderStr.toLowerCase().startsWith('p') || genderStr.toLowerCase().includes('perempuan') || genderStr.toLowerCase().includes('wanita')) {
          genderStr = 'Perempuan';
        }

        // 2. Format Tempat & Tanggal Lahir (Kolom G & H)
        const tempat = (idxTempatLahir !== -1 && row[idxTempatLahir]) ? row[idxTempatLahir].toString().trim() : '';
        const tgl = (idxTglLahir !== -1 && row[idxTglLahir]) ? row[idxTglLahir].toString().trim() : '';
        
        let ttlStr = '-';
        if (tempat && tgl && tempat.toLowerCase() !== tgl.toLowerCase()) {
          ttlStr = tempat + ', ' + tgl;
        } else if (tempat && tgl && tempat.toLowerCase() === tgl.toLowerCase()) {
          ttlStr = tempat;
        } else if (tempat) {
          ttlStr = tempat;
        } else if (tgl) {
          ttlStr = tgl;
        }

        // 3. Format Alamat Lengkap (Kolom I, J, K)
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

        // 4. Format Masking Tampilan NIK (contoh: 321605****01 atau 321605600301****)
        let maskedNIK = rowNIKVal || (query12 + '****');
        if (!maskedNIK.includes('*')) {
          maskedNIK = query12.substring(0, 6) + '****' + query12.substring(10);
        }

        const rawNama = (idxNama !== -1 && row[idxNama]) ? row[idxNama].toString().trim().toUpperCase() : '';

        matches.push({
          id: matches.length + 1,
          nik: query12,
          nikRaw: rowNIKVal || query12,
          nikMasked: maskedNIK,
          nkk: (idxNKK !== -1 && row[idxNKK]) ? row[idxNKK].toString().trim() : '',
          nama: rawNama || 'WARGA DESA KARANG SATRIA',
          gender: genderStr || 'Laki-laki / Perempuan',
          tempatLahir: tempat,
          tanggalLahir: tgl,
          ttl: ttlStr,
          alamat: alamatFull || 'Desa Karang Satria, Kec. Tambun Utara',
          rt: rt,
          rw: rw,
          noUrut: (idxNoUrut !== -1 && row[idxNoUrut]) ? row[idxNoUrut].toString().trim() : '',
          tps: tpsName,
          tpsLokasi: 'Lokasi Pemungutan Suara ' + tpsName + ' Desa Karang Satria',
          status: (idxKet !== -1 && row[idxKet] && row[idxKet].trim()) ? row[idxKet].toString().trim() : 'DPT AKTIF'
        });
      }
    }
  }

  // Jika NIK tidak ditemukan
  if (matches.length === 0) {
    return {
      status: 'not_found',
      message: 'NIK ' + query12 + '... belum terdaftar dalam database DPS/DPT (95 TPS) Pemilihan Kepala Desa Karang Satria 2026-2034. Pastikan nomor NIK 12 digit sudah benar atau hubungi panitia desa.'
    };
  }

  // KONDISI A: Tepat 1 nama yang cocok -> Langsung buka Kartu TPS
  if (matches.length === 1) {
    const singleResult = {
      status: 'success',
      data: matches[0],
      total: 1,
      message: 'Data DPT Resmi Ditemukan.'
    };

    try {
      CacheService.getScriptCache().put(cacheKey, JSON.stringify(singleResult), 21600);
    } catch (e) {}

    return singleResult;
  }

  // KONDISI B: Lebih dari 1 nama yang cocok (NIK 12 digit serupa) -> Tampilkan list pilihan nama
  const multiResult = {
    status: 'multiple',
    data: matches,
    total: matches.length,
    message: 'Ditemukan ' + matches.length + ' data warga dengan 12 digit NIK yang serupa. Silakan klik nama Anda untuk melihat lokasi TPS.'
  };

  try {
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(multiResult), 21600);
  } catch (e) {}

  return multiResult;
}

/**
 * 4. Helper Pencocokan 12 Digit NIK dengan Format Database (misal: 321605600301****)
 */
function isNikMatch(rowVal, query12) {
  if (!rowVal || !query12) return false;
  
  const rawStr = rowVal.toString().trim();
  const rowDigits = rawStr.replace(/[^0-9]/g, '');
  const cleanQ = query12.toString().replace(/[^0-9]/g, '').substring(0, 12);
  
  if (cleanQ.length < 12) return false;

  // 1. Format Database standar: 12 digit angka + 4 bintang (misal: 321605600301****)
  // rowDigits murninya menghasilkan 12 digit angka persis
  if (rowDigits.length === 12 && rowDigits === cleanQ) {
    return true;
  }

  // 2. Cek teks mentah diawali 12 digit NIK (misal: '321605600301****')
  if (rawStr.startsWith(cleanQ)) {
    return true;
  }

  // 3. Jika di sheet berisi 16 digit angka penuh (misal: 3216056003010001)
  if (rowDigits.length === 16 && rowDigits.substring(0, 12) === cleanQ) {
    return true;
  }

  // 4. Jika di sheet berisi sensor bintang di tengah (misal: 321605****010001)
  if (rawStr.includes('*') || rawStr.toLowerCase().includes('x')) {
    const parts = rawStr.split(/[*xX]+/);
    if (parts.length >= 2) {
      const prefix = parts[0].replace(/[^0-9]/g, '');
      const suffix = parts[parts.length - 1].replace(/[^0-9]/g, '');
      if (prefix && suffix && cleanQ.startsWith(prefix) && cleanQ.endsWith(suffix.substring(0, Math.min(suffix.length, 2)))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 5. Setup Format Otomatis 95 Sheet TPS (TPS 1 s/d TPS 95)
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
 * 6. Bersihkan Cache Pencarian NIK
 */
function clearSearchCache() {
  try {
    CacheService.getScriptCache().removeAll(['DPT_NIK_12_', 'DPT_FUZZY_']);
    SpreadsheetApp.getActiveSpreadsheet().toast('Cache pencarian berhasil dibersihkan.', 'Cache Refresh', 4);
  } catch (e) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Cache telah direfresh.', 'Info', 3);
  }
}

/**
 * 7. Custom Menu di Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🗳️ Pilkades Karang Satria')
    .addItem('🛠️ Setup Otomatis 95 Sheet TPS (TPS 1 - 95)', 'setupSpreadsheet')
    .addItem('🔍 Uji Cari NIK 12 Digit (Lintas 95 TPS)', 'testCariNIK')
    .addItem('🔄 Refresh / Bersihkan Cache Pencarian', 'clearSearchCache')
    .addToUi();
}

function testCariNIK() {
  const ui = SpreadsheetApp.getUi();
  const promptNIK = ui.prompt('Cari Data Pemilih Pilkades (95 TPS)', 'Masukkan 12 Digit NIK (Contoh: 321605600301):', ui.ButtonSet.OK_CANCEL);
  if (promptNIK.getSelectedButton() !== ui.Button.OK) return;

  const res = searchByNIK(promptNIK.getResponseText());
  if (res.status === 'success') {
    ui.alert('DATA DITEMUKAN! 🎉', 
      'Nama Terdaftar: ' + res.data.nama + '\n' +
      'Jenis Kelamin: ' + res.data.gender + '\n' +
      'TTL: ' + res.data.ttl + '\n' +
      'TPS: ' + res.data.tps + '\n' +
      'Alamat: ' + res.data.alamat + '\n' +
      'Status: ' + res.data.status, 
      ui.ButtonSet.OK
    );
  } else if (res.status === 'multiple') {
    ui.alert('DITEMUKAN ' + res.total + ' DATA WARGA! 👥',
      res.message + '\n\n' +
      res.data.map((w, idx) => (idx + 1) + '. ' + w.nama + ' (' + w.tps + ' - ' + w.alamat + ')').join('\n'),
      ui.ButtonSet.OK
    );
  } else {
    ui.alert('HASIL PENCARIAN', res.message, ui.ButtonSet.OK);
  }
}
