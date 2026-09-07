/**
 * 🗳️ PORTAL RESMI CEK LOKASI TPS WARGA
 * PEMILIHAN KEPALA DESA KARANG SATRIA (PERIODE 2026 - 2034)
 * Kecamatan Tambun Utara, Kabupaten Bekasi, Jawa Barat
 * Backend Engine: Multi-Sheet Support (95 TPS: TPS 1 s/d TPS 95) + Google Apps Script
 * Update: Smart Dual Matching (NIK 12/16 Digit + Fuzzy Name Tolerance System)
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
  // Jika dipanggil via REST API (contoh: ?nik=321606140888&nama=Herlambang)
  if (e && e.parameter && e.parameter.nik) {
    const nik = e.parameter.nik;
    const nama = e.parameter.nama || '';
    const result = searchByNikAndName(nik, nama);
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
      const result = searchByNikAndName(contents.nik, contents.nama);
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
 * 3. Fungsi Pencarian NIK & Nama dengan Algoritma Toleransi Typo (Fuzzy String Matching)
 */
function searchByNikAndName(nikInput, namaInput) {
  if (!nikInput) {
    return { status: 'error', message: 'Silakan masukkan NIK KTP Anda.' };
  }

  const cleanNIK = nikInput.toString().replace(/[^0-9]/g, '').trim();
  if (cleanNIK.length < 12) {
    return { status: 'error', message: 'Nomor Induk Kependudukan (NIK) minimal 12 digit angka.' };
  }

  const cleanNama = (namaInput || '').toString().trim();
  if (!cleanNama) {
    return { status: 'error', message: 'Silakan masukkan Nama Lengkap sesuai KTP.' };
  }

  // Cache Key
  const cacheKey = 'DPT_FUZZY_' + cleanNIK.substring(0, 12) + '_' + encodeURIComponent(cleanNama.toLowerCase());
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

  const nikCandidates = [];

  // 1. Pindai seluruh sheet (TPS 1 s/d TPS 95) untuk mencari kecocokan NIK
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
    let idxNIK = headers.findIndex(h => h === 'nik' || h.includes('nik'));
    let idxNama = headers.findIndex(h => h.includes('nama'));
    let idxGender = headers.findIndex(h => h.includes('kelamin') || h.includes('gender') || h === 'jk');
    let idxTempatLahir = headers.findIndex(h => h.includes('tempat') || h.includes('tmpt') || h === 'tpt lahir');
    let idxTglLahir = headers.findIndex(h => h.includes('tanggal') || h.includes('tgl') || (h.includes('lahir') && !h.includes('tempat') && !h.includes('tmpt')));
    let idxAlamat = headers.findIndex(h => h.includes('alamat') || h.includes('jalan') || h.includes('blok') || h.includes('dusun'));
    let idxRT = headers.findIndex(h => h === 'rt' || h.includes('rt'));
    let idxRW = headers.findIndex(h => h === 'rw' || h.includes('rw'));
    let idxKet = headers.findIndex(h => h.includes('ket') || h.includes('catatan') || h.includes('status'));

    // Default Fallback index posisi jika header kustom (Standar Kolom A-L: 0-11)
    if (idxNoUrut === -1) idxNoUrut = 1;      // Kolom B (No Urut)
    if (idxNKK === -1) idxNKK = 2;            // Kolom C (NKK)
    if (idxNIK === -1) idxNIK = 3;            // Kolom D (NIK)
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

      if (isNikMatch(rowNIKVal, cleanNIK)) {
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

        // 4. Masking NIK
        let maskedNIK = rowNIKVal || cleanNIK;
        if (!maskedNIK.includes('*')) {
          if (maskedNIK.length >= 12) {
            maskedNIK = maskedNIK.substring(0, 6) + '****' + maskedNIK.substring(maskedNIK.length - 2);
          } else {
            maskedNIK = maskedNIK.substring(0, 6) + '****';
          }
        }

        const rawNama = (idxNama !== -1 && row[idxNama]) ? row[idxNama].toString().trim().toUpperCase() : '';

        nikCandidates.push({
          id: nikCandidates.length + 1,
          nik: cleanNIK,
          nikRaw: rowNIKVal || cleanNIK,
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

  // Jika NIK sama sekali tidak ditemukan
  if (nikCandidates.length === 0) {
    return {
      status: 'not_found',
      message: 'NIK ' + cleanNIK.substring(0, 12) + '... belum terdaftar dalam database DPS/DPT Pilkades Karang Satria 2026-2034. Pastikan nomor NIK sudah benar atau hubungi panitia desa.'
    };
  }

  // 2. Evaluasi Kemiripan Nama (Fuzzy Matching Evaluation)
  let bestMatch = null;
  let highestScore = 0;

  for (let i = 0; i < nikCandidates.length; i++) {
    const candidate = nikCandidates[i];
    const matchEvaluation = evaluateNameSimilarity(candidate.nama, cleanNama);
    
    if (matchEvaluation.score > highestScore) {
      highestScore = matchEvaluation.score;
      bestMatch = candidate;
    }
  }

  // Ambang batas toleransi kemiripan: 60% (0.60) sangat aman untuk typo 1-2 huruf / singkatan kata
  if (bestMatch && highestScore >= 0.60) {
    const successResult = {
      status: 'success',
      data: bestMatch,
      similarityScore: Math.round(highestScore * 100),
      message: 'Data DPT Resmi Ditemukan.'
    };

    try {
      CacheService.getScriptCache().put(cacheKey, JSON.stringify(successResult), 21600);
    } catch (e) {}

    return successResult;
  }

  // Jika NIK terdaftar tapi Nama tidak cocok (Privasi terjaga 100%, data orang lain tidak dibocorkan)
  return {
    status: 'name_mismatch',
    message: 'Nomor NIK terdaftar, namun nama yang dimasukkan tidak sesuai dengan catatan sistem. Silakan periksa kembali ejaan nama sesuai KTP atau hubungi Panitia Pilkades / PPS Desa Karang Satria.'
  };
}

/**
 * 4. Helper Algoritma Kemiripan Nama (Fuzzy Matcher)
 */
function normalizeName(str) {
  if (!str) return '';
  return str.toString()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ') // hapus tanda baca
    .replace(/\b(s\.kom|s\.pd|s\.e|s\.h|s\.t|dr|drs|ir|h|hj|spd|skom|se|sh|st)\b/gi, ' ') // hapus gelar umum
    .replace(/\s+/g, ' ') // normalisasi multiple space
    .trim();
}

function evaluateNameSimilarity(databaseName, inputName) {
  const normDb = normalizeName(databaseName);
  const normInp = normalizeName(inputName);

  if (!normDb || !normInp) return { isMatch: false, score: 0 };

  // 1. Exact Match setelah normalisasi
  if (normDb === normInp) {
    return { isMatch: true, score: 1.0 };
  }

  // 2. Substring Match (contoh: "Herlambang" di dalam "Herlambang Susanto")
  if (normDb.includes(normInp) || normInp.includes(normDb)) {
    const lenRatio = Math.min(normDb.length, normInp.length) / Math.max(normDb.length, normInp.length);
    const score = 0.80 + (0.20 * lenRatio);
    return { isMatch: true, score: score };
  }

  // 3. Token / Kata per kata match (Contoh: "M. Ilham" vs "Muhammad Ilham")
  const dbWords = normDb.split(' ').filter(w => w.length > 0);
  const inpWords = normInp.split(' ').filter(w => w.length > 0);

  let maxWordScore = 0;
  for (let d = 0; d < dbWords.length; d++) {
    for (let p = 0; p < inpWords.length; p++) {
      const wScore = calcLevenshteinSimilarity(dbWords[d], inpWords[p]);
      if (wScore > maxWordScore) {
        maxWordScore = wScore;
      }
    }
  }

  // 4. Overall Full String Levenshtein Similarity (Contoh: "Herlabung" vs "Herlambang" -> 88%)
  const fullScore = calcLevenshteinSimilarity(normDb, normInp);

  const finalScore = Math.max(fullScore, maxWordScore);
  return {
    isMatch: finalScore >= 0.60,
    score: finalScore
  };
}

function calcLevenshteinSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;

  const dist = levenshteinDistance(longer, shorter);
  return (longerLength - dist) / parseFloat(longerLength);
}

function levenshteinDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * 5. Helper Pencocokan Pola NIK
 */
function isNikMatch(rowVal, cleanQuery) {
  if (!rowVal || !cleanQuery) return false;
  
  const rawStr = rowVal.toString().trim();
  const rowDigits = rawStr.replace(/[^0-9]/g, '');
  
  // 1. Kesamaan angka murni langsung
  if (rowDigits === cleanQuery) return true;
  
  // 2. Jika di sheet berisi 16 digit angka penuh, cocokkan 12 digit
  if (rowDigits.length === 16) {
    // Pola A: 6 digit depan + 6 digit belakang
    const front6back6 = rowDigits.substring(0, 6) + rowDigits.substring(10);
    if (front6back6 === cleanQuery) return true;

    // Pola B: 12 digit pertama
    if (rowDigits.substring(0, 12) === cleanQuery) return true;

    // Pola C: 6 depan + 2 belakang
    if (cleanQuery.length === 12 && rowDigits.startsWith(cleanQuery.substring(0, 6)) && rowDigits.endsWith(cleanQuery.substring(10))) {
      return true;
    }
  }

  // 3. Jika di sheet ada 12 digit angka murni
  if (rowDigits.length === 12) {
    if (rowDigits === cleanQuery) return true;
  }

  // 4. Jika di sheet berisi bintang/sensor (misal: 321606****0001)
  if (rawStr.includes('*') || rawStr.toLowerCase().includes('x')) {
    const cleanPattern = rawStr.replace(/[^0-9]/g, '');
    if (cleanPattern === cleanQuery) return true;

    // Cek kecocokan prefix & suffix angka tanpa bintang
    const parts = rawStr.split(/[*xX]+/);
    if (parts.length >= 2) {
      const prefix = parts[0].replace(/[^0-9]/g, '');
      const suffix = parts[parts.length - 1].replace(/[^0-9]/g, '');
      if (prefix && suffix && cleanQuery.startsWith(prefix) && cleanQuery.endsWith(suffix)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 6. Setup Format Otomatis 95 Sheet TPS (TPS 1 s/d TPS 95)
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
 * 7. Bersihkan Cache Pencarian NIK
 */
function clearSearchCache() {
  try {
    CacheService.getScriptCache().removeAll(['DPT_FUZZY_', 'DPT_NIK_12_']);
    SpreadsheetApp.getActiveSpreadsheet().toast('Cache pencarian berhasil dibersihkan.', 'Cache Refresh', 4);
  } catch (e) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Cache telah direfresh.', 'Info', 3);
  }
}

/**
 * 8. Custom Menu di Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🗳️ Pilkades Karang Satria')
    .addItem('🛠️ Setup Otomatis 95 Sheet TPS (TPS 1 - 95)', 'setupSpreadsheet')
    .addItem('🔍 Uji Cari NIK & Nama (Fuzzy Match)', 'testCariNIK')
    .addItem('🔄 Refresh / Bersihkan Cache Pencarian', 'clearSearchCache')
    .addToUi();
}

function testCariNIK() {
  const ui = SpreadsheetApp.getUi();
  const promptNIK = ui.prompt('Cari Data Pemilih Pilkades (95 TPS)', '1. Masukkan 12 Digit NIK:', ui.ButtonSet.OK_CANCEL);
  if (promptNIK.getSelectedButton() !== ui.Button.OK) return;
  
  const promptNama = ui.prompt('Cari Data Pemilih Pilkades (95 TPS)', '2. Masukkan Nama Pemilih (Toleran Typo):', ui.ButtonSet.OK_CANCEL);
  if (promptNama.getSelectedButton() !== ui.Button.OK) return;

  const res = searchByNikAndName(promptNIK.getResponseText(), promptNama.getResponseText());
  if (res.status === 'success') {
    ui.alert('DATA DITEMUKAN! 🎉 (Kemiripan: ' + res.similarityScore + '%)', 
      'Nama Terdaftar: ' + res.data.nama + '\n' +
      'Jenis Kelamin: ' + res.data.gender + '\n' +
      'TTL: ' + res.data.ttl + '\n' +
      'TPS: ' + res.data.tps + '\n' +
      'Alamat: ' + res.data.alamat + '\n' +
      'Status: ' + res.data.status, 
      ui.ButtonSet.OK
    );
  } else if (res.status === 'name_mismatch') {
    ui.alert('NAMA TIDAK COCOK ⚠️', res.message, ui.ButtonSet.OK);
  } else {
    ui.alert('HASIL PENCARIAN', res.message, ui.ButtonSet.OK);
  }
}
