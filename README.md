
# Panduan Instalasi dan Arsitektur Aplikasi di Ubuntu 22.04

Dokumen ini menjelaskan cara menginstal, mengonfigurasi, dan memahami arsitektur aplikasi ini pada sistem operasi Ubuntu 22.04.

## 1. Arsitektur Inti: Cloudinary & Firebase

Sebelum instalasi, penting untuk memahami bagaimana dua layanan cloud utama bekerja sama dalam aplikasi ini:

*   **Cloudinary**: Bertindak sebagai **penyimpanan file eksternal (CDN)**. Semua file gambar yang diunggah oleh pengguna atau dibuat oleh AI akan disimpan di sini. Cloudinary menyediakan URL publik untuk setiap gambar.
*   **Firebase Firestore**: Bertindak sebagai **database utama**. Firestore **tidak menyimpan file gambar secara langsung**. Sebaliknya, ia menyimpan *metadata* atau informasi tentang gambar tersebut, seperti nama file, kategori, tanggal pembuatan, dan yang paling penting, **URL gambar yang merujuk ke Cloudinary**.

**Alur Kerja Unggah Gambar:**
1.  Pengguna mengunggah gambar.
2.  Aplikasi mengirim file gambar ke Cloudinary.
3.  Cloudinary menyimpan gambar dan memberikan URL publik.
4.  Aplikasi menyimpan URL tersebut (bersama data lain seperti kategori) sebagai dokumen baru di Firestore.
5.  Saat menampilkan gambar, aplikasi mengambil data dari Firestore, mendapatkan URL Cloudinary, dan menampilkannya kepada pengguna.

## 2. Prasyarat

Pastikan sistem Anda telah terinstal perangkat lunak berikut:
- **Node.js**: Versi 18.x atau yang lebih baru.
- **npm**: Biasanya terinstal bersama Node.js.
- **Git**: Untuk mengkloning repositori.

### Instalasi Prasyarat
```bash
# Perbarui daftar paket
sudo apt update && sudo apt upgrade -y

# Instal Git
sudo apt install git -y

# Instal Node.js dan npm (disarankan menggunakan nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Muat nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instal Node.js versi 18
nvm install 18
nvm use 18
```

## 3. Instalasi Aplikasi

```bash
# 1. Klona repositori (jika belum)
# git clone <URL_REPOSITORI>
# cd <NAMA_DIREKTORI_PROYEK>

# 2. Instal dependensi
npm install
```

## 4. Konfigurasi Lingkungan (`.env`)

**LANGKAH INI SANGAT PENTING.** Tanpa konfigurasi ini, fitur-fitur inti tidak akan berjalan.

1.  Buat berkas `.env` di direktori utama proyek:
    ```bash
    touch .env
    ```

2.  Salin dan tempel templat di bawah ini ke dalam berkas `.env` Anda, lalu isi nilainya sesuai petunjuk.

    ```
    # --- Kredensial Klien Firebase (Browser) ---
    NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="proyek-anda.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="proyek-anda"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="proyek-anda.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="12345..."
    NEXT_PUBLIC_FIREBASE_APP_ID="1:12345...:web:..."
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-..."

    # --- Kredensial Admin Server Firebase (Rahasia) ---
    FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-..."
    # Kunci privat yang sudah di-encode ke Base64 (lihat instruksi di bawah)
    FIREBASE_ADMIN_PRIVATE_KEY_BASE64="LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5..."

    # --- Kunci API Google AI (Rahasia) ---
    GEMINI_API_KEY="AIza..."

    # --- Konfigurasi Cloudinary (Hosting Gambar & Video) ---
    # Salin nilai variabel lingkungan dari dasbor Cloudinary Anda
    CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"
    ```

### 4.1. Mendapatkan Kredensial Firebase & Google AI

Ikuti petunjuk di [Panduan Resmi Firebase](https://firebase.google.com/docs/web/setup) dan [Google AI Studio](https://aistudio.google.com/app/apikey) untuk mendapatkan nilai-nilai di atas. Untuk `FIREBASE_ADMIN_PRIVATE_KEY_BASE64`, Anda perlu men-download file JSON service account, lalu mengubah nilai `private_key` menjadi format Base64.

Gunakan perintah ini untuk encode kunci privat:
```bash
# Ganti path/to/your/keyfile.json dengan path file JSON Anda
cat path/to/your/keyfile.json | jq -r .private_key | base64 | tr -d '\n'
```
*Jika Anda tidak memiliki `jq`, instal dengan: `sudo apt-get install jq`*

### 4.2. Mendapatkan Kredensial Cloudinary

1.  Buat akun di [Cloudinary](https://cloudinary.com/).
2.  Buka **Dashboard** Anda.
3.  Temukan bagian **API Environment variable**.
4.  Salin seluruh nilai (dimulai dengan `cloudinary://...`) dan tempelkan ke `CLOUDINARY_URL` di berkas `.env` Anda.

## 5. Menjalankan Aplikasi

Setelah semua konfigurasi selesai, **restart server pengembangan Anda** untuk memuat variabel `.env` yang baru.

```bash
# Hentikan server jika sedang berjalan (Ctrl+C), lalu jalankan lagi
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3002`.
