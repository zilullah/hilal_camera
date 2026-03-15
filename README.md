# 🌙 Hilal Camera

**Hilal Camera** adalah aplikasi mobile berbasis AI untuk mendeteksi dan melacak **hilal (bulan sabit)** secara presisi menggunakan kamera, sensor perangkat, dan kalkulasi astronomi real-time. Dibangun sebagai portofolio proyek menggunakan **React Native + Expo**.

---

## 📱 Tentang Aplikasi

Hilal adalah fenomena alam berupa kemunculan bulan sabit tipis setelah bulan baru, yang sangat penting dalam penentuan awal bulan dalam kalender Hijriah (seperti Ramadan dan Idulfitri). Aplikasi ini membantu pengguna untuk:

- Mengetahui **posisi dan kondisi hilal** berdasarkan lokasi GPS saat ini
- Melacak hilal secara visual menggunakan **Augmented Reality (AR)** pada kamera
- Menganalisis foto hasil jepretan menggunakan **kecerdasan buatan (AI)** untuk menghitung kemungkinan terlihatnya hilal
- Mendukung **Multi-bahasa** (Bahasa Indonesia & Inggris)

---

## ✨ Fitur Utama

### 1. 🗺️ Dashboard Kondisi Hilal (Home Screen)
Layar utama menampilkan kondisi hilal hari ini berdasarkan lokasi pengguna.

- **Altitude Bulan** — ketinggian bulan di atas cakrawala dalam derajat
- **Elongasi** — sudut antara bulan dan matahari
- **Visibility Score** — skor persentase kemungkinan hilal dapat terlihat
- **Informasi Lokasi & Tanggal** — koordinat GPS dan tanggal saat ini

**Teknologi yang digunakan:**
| Teknologi | Fungsi |
|---|---|
| [`astronomy-engine`](https://github.com/cosinekitty/astronomy) | Kalkulasi posisi bulan & matahari menggunakan model astronomis presisi tinggi |
| `expo-location` | Mendapatkan koordinat GPS pengguna secara real-time |
| `react-native-paper` | Komponen UI (`Card`, `Button`, `Text`) |

---

### 2. 📷 Kamera AR Hilal Tracker (Camera Screen)
Layar kamera dengan overlay Augmented Reality yang menunjukkan **prediksi posisi hilal** secara langsung di layar.

- **AR Moon Marker** — penanda posisi hilal yang bergerak sesuai arah kamera
- **Live Compass (Azimuth)** — pembacaan kompas real-time untuk orientasi perangkat
- **Grid Kamera** — grid on/off untuk membantu framing dan stabilisasi
- **Kontrol Exposure Digital** — slider exposure untuk menyesuaikan kecerahan gambar sebelum capture
- **Capture Foto** — mengambil foto dan meneruskan ke layar analisis

**Teknologi yang digunakan:**
| Teknologi | Fungsi |
|---|---|
| `expo-camera` | Akses live camera feed dan pengambilan foto |
| `expo-sensors` (Magnetometer) | Membaca data kompas (azimuth) untuk menentukan arah hadap perangkat |
| `astronomy-engine` | Menghitung posisi azimuth & altitude bulan agar marker AR akurat |
| `react-native-paper` | Komponen UI ikon dan tombol |
| `expo-router` | Navigasi antar layar |

---

### 3. 🔬 Analisis AI Deteksi Hilal (Result Screen)
Setelah foto diambil, gambar diproses oleh model AI untuk mendeteksi keberadaan hilal.

Pipeline analisis gambar:
1. **Konversi Grayscale** — mengubah gambar ke skala abu-abu
2. **Glare Reduction (Sun Masking)** — menghilangkan area over-expose (terang >90%) agar silau matahari/lens flare tidak mengganggu analisis
3. **Contrast Enhancement & Digital Exposure** — normalisasi kontras + kompensasi exposure sesuai setting pengguna
4. **Brightness Score** — skor kecerahan area non-silau yang mengindikasikan objek terang tipis
5. **Curve Score (Gradient Analysis)** — deteksi heuristik pola lengkungan tipis menggunakan analisis varians lokal
6. **Final Probability** — skor akhir gabungan dari 3 sub-skor: Astronomy Model (60%), Brightness Analysis (25%), Curve Pattern (15%)

Hasil ditampilkan sebagai:
- **Persentase probabilitas** deteksi hilal
- **Status Confidence** — HIGH / MEDIUM / LOW
- **Metrik Detail** — breakdown skor brightness, curve, dan astronomy

**Teknologi yang digunakan:**
| Teknologi | Fungsi |
|---|---|
| `@tensorflow/tfjs` | Engine utama untuk komputasi tensor dan pemrosesan gambar |
| `@tensorflow/tfjs-react-native` | Adapter TensorFlow.js untuk React Native + `decodeJpeg` |
| `expo-file-system` | Membaca file foto sebagai Base64 untuk diproses TensorFlow |
| `astronomy-engine` | Memberikan skor astronomi berdasarkan posisi bulan |

---

### 4. ✨ Splash Screen Animasi
Splash screen kustom yang tampil saat aplikasi pertama dibuka.

- Latar belakang gelap dengan efek **bintang-bintang**
- **Animasi spring** pada icon aplikasi (fade in + scale)
- **Glow emas pulsing** di belakang icon
- **Loading bar** dengan teks "Initializing AI Engine..."
- Fade-in halus ke halaman utama setelah AI siap

**Teknologi yang digunakan:** `expo-splash-screen`, `React Native Animated API`
92: 
93: ---
94: 
95: ### 5. 🌐 Internationalization (i18n)
96: Aplikasi mendukung Bahasa Indonesia (default) dan Bahasa Inggris.
97: 
98: - **Language Toggle** — Tombol pada Home Screen untuk mengganti bahasa secara instan
99: - **Local Persistance** — Menggunakan `expo-localization` untuk mendeteksi preferensi perangkat
100: 
101: **Teknologi yang digunakan:** `i18next`, `react-i18next`, `expo-localization`
102: 
103: ---
104: 

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | [Expo](https://expo.dev) ~55 + [React Native](https://reactnative.dev) 0.83 |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Navigation | [Expo Router](https://expo.github.io/router) (file-based routing) |
| AI / Vision | [TensorFlow.js](https://www.tensorflow.org/js) + `tfjs-react-native` |
| Astronomi | [astronomy-engine](https://github.com/cosinekitty/astronomy) |
| UI Components | [React Native Paper](https://reactnativepaper.com) (MD3 Dark Theme) |
| Kamera | `expo-camera` |
| Sensor | `expo-sensors` (Magnetometer) |
| Lokasi | `expo-location` |
| i18n | `i18next` + `react-i18next` |

---

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js >= 18
- Expo CLI
- Android emulator / device, atau iOS simulator

### Instalasi

```bash
# Clone repository
git clone https://github.com/username/hilal-camera.git
cd hilal-camera

# Install dependencies
npm install
```

### Menjalankan Aplikasi

```bash
# Semua platform
npx expo start

# Android saja
npm run android

# iOS saja
npm run ios
```

> **Catatan:** Fitur kamera dan sensor memerlukan perangkat fisik. Gunakan [Expo Go](https://expo.dev/go) atau development build untuk testing di device nyata.

---

## 📁 Struktur Proyek

```
hilal-camera/
├── src/
│   ├── app/
│   │   ├── _layout.tsx        # Root layout + splash screen animasi
│   │   ├── index.tsx          # Home screen (dashboard kondisi hilal)
│   │   ├── camera.tsx         # Kamera AR + sensor kompas
│   │   └── result.tsx         # Hasil analisis AI
│   ├── components/
│   │   └── HilalCard.tsx      # Komponen kartu statistik hilal
│   ├── services/
│   │   ├── astronomyService.ts  # Kalkulasi posisi bulan/matahari
│   │   ├── locationService.ts   # GPS location
│   │   └── sensorService.ts     # Kompas magnetometer
│   ├── i18n/
│   │   ├── index.ts             # Konfigurasi i18next
│   │   └── locales/             # JSON translation files (en, id)
│   └── vision/
│       └── hilalDetection.ts    # Pipeline analisis gambar TensorFlow.js
├── assets/
│   └── images/
│       ├── icon.png             # App icon
│       └── splash-icon.png      # Splash screen image
├── app.json                     # Konfigurasi Expo
└── package.json
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan portofolio pribadi.
