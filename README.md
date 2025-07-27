
# Panduan Instalasi Aplikasi di Ubuntu 22.04

Dokumen ini menjelaskan cara menginstal dan menjalankan aplikasi ini pada sistem operasi Ubuntu 22.04.

## 1. Prasyarat

Sebelum memulai, pastikan sistem Anda telah terinstal perangkat lunak berikut:

- **Node.js**: Versi 18.x atau yang lebih baru.
- **npm**: Biasanya terinstal bersama Node.js.
- **Git**: Untuk mengkloning repositori.

### Instalasi Prasyarat

Jika Anda belum menginstalnya, buka terminal dan jalankan perintah berikut:

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
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Instal Node.js versi 18
nvm install 18
nvm use 18

# Verifikasi instalasi
node -v
npm -v
```

## 2. Instalasi Aplikasi

Ikuti langkah-langkah berikut untuk menginstal dependensi aplikasi.

```bash
# 1. Klona repositori (jika Anda belum memiliki kodenya)
# git clone <URL_REPOSITORI>
# cd <NAMA_DIREKTORI_PROYEK>

# 2. Instal dependensi proyek
npm install
```

## 3. Konfigurasi Lingkungan (Environment)

**LANGKAH INI SANGAT PENTING.** Aplikasi ini memerlukan beberapa set kredensial. Tanpa ini, fitur-fitur penting seperti login, penyimpanan data, dan AI tidak akan berjalan.

1.  **Buat Berkas `.env`**:
    Di dalam direktori utama proyek Anda, buat sebuah berkas baru bernama `.env`.
    ```bash
    touch .env
    ```

2.  **Isi Berkas `.env` dengan Templat Berikut**:
    Salin dan tempel templat di bawah ini ke dalam berkas `.env` Anda.

    ```
    # --- Kredensial Klien (Browser) ---
    NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="proyek-anda.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="proyek-anda"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="proyek-anda.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="12345..."
    NEXT_PUBLIC_FIREBASE_APP_ID="1:12345...:web:..."
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-..."

    # --- Kredensial Admin Server (Rahasia) ---
    FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-..."
    # Kunci privat yang sudah di-encode ke Base64 (lihat instruksi di bawah)
    FIREBASE_ADMIN_PRIVATE_KEY_BASE64="LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5..."

    # --- Kunci API Google AI (Rahasia) ---
    GEMINI_API_KEY="AIza..."

    # --- Konfigurasi Cloudinary (Hosting Gambar & Video) ---
    # Salin nilai variabel lingkungan dari dasbor Cloudinary Anda
    CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"
    ```

### 3.1. Mendapatkan Kredensial Klien Firebase (NEXT_PUBLIC_*)

Nilai-nilai ini aman untuk diekspos di browser.
1. Buka **Firebase Console**.
2. Klik ikon gerigi (⚙️) di sebelah "Project Overview" dan pilih **Project settings**.
3. Di tab **General**, di bawah **Your apps**, pilih aplikasi web Anda.
4. Di bagian **Firebase SDK snippet**, pilih **Config**.
5. Salin nilai-nilai yang sesuai ke dalam variabel `NEXT_PUBLIC_*` di berkas `.env` Anda.

### 3.2. Mendapatkan Kredensial Admin Server Firebase (FIREBASE_ADMIN_*)

Nilai-nilai ini **SANGAT RAHASIA** dan hanya boleh digunakan di server. **JANGAN PERNAH** membagikannya di sisi klien.

1.  **Unduh Kunci Privat**:
    *   Buka **Firebase Console** -> **Project settings**.
    *   Navigasi ke tab **Service accounts**.
    *   Klik tombol **Generate new private key**. Sebuah file JSON akan terunduh.

2.  **Isi `FIREBASE_ADMIN_CLIENT_EMAIL`**:
    *   Buka file JSON yang baru saja diunduh dan salin nilai dari `"client_email"`.

3.  **Encode dan Isi `FIREBASE_ADMIN_PRIVATE_KEY_BASE64`**:
    *   Ubah kunci privat menjadi format **Base64** untuk keamanan. Jalankan perintah ini di terminal:
        ```bash
        # Ganti path/to/your/keyfile.json dengan path file JSON Anda
        cat path/to/your/keyfile.json | jq -r .private_key | base64 | tr -d '\n'
        ```
        *Jika Anda tidak memiliki `jq`, instal dengan: `sudo apt-get install jq`*
    *   **Salin seluruh output** dan tempelkan ke `FIREBASE_ADMIN_PRIVATE_KEY_BASE64`.

### 3.3. Mendapatkan Kunci API Google AI (GEMINI_API_KEY)

1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Buat kunci API baru dan salin nilainya ke `GEMINI_API_KEY`.

### 3.4. Mendapatkan Kredensial Cloudinary

Layanan ini digunakan untuk meng-host semua gambar yang diunggah.
1. Buat akun di [Cloudinary](https://cloudinary.com/).
2. Buka **Dashboard** Anda.
3. Temukan bagian **API Environment variable**.
4. Salin seluruh nilai (dimulai dengan `cloudinary://...`) dan tempelkan ke `CLOUDINARY_URL` di berkas `.env` Anda.

## 4. Konfigurasi Firebase Authentication

1.  Buka **Firebase Console**.
2.  Navigasi ke **Authentication** -> **Sign-in method**.
3.  Pilih **Email/Password** dan aktifkan.
4.  Buat setidaknya satu pengguna di tab **Users** agar Anda dapat login ke dasbor.

## 5. Menjalankan Aplikasi

Setelah semua konfigurasi selesai, **restart server pengembangan Anda** untuk memuat variabel `.env` yang baru.

```bash
# Hentikan server jika sedang berjalan (Ctrl+C), lalu jalankan lagi
npm run dev
```

Aplikasi akan berjalan dan dapat diakses di `http://localhost:3002`.

## 6. Menjalankan Aplikasi di Latar Belakang dengan PM2 (Opsional)

Untuk menjalankan aplikasi secara persisten di server produksi, gunakan manajer proses seperti `pm2`.

### 6.1. Instalasi PM2

```bash
sudo npm install pm2 -g
```

### 6.2. Menjalankan Aplikasi dengan PM2

1.  **Build Aplikasi untuk Produksi**:
    ```bash
    npm run build
    ```

2.  **Jalankan Aplikasi**:
    ```bash
    pm2 start npm --name "ukm-ponja-app" -- run start
    ```

### 6.3. Mengelola Aplikasi dengan PM2

-   **Melihat status**: `pm2 list`
-   **Melihat log**: `pm2 logs ukm-ponja-app`
-   **Menghentikan**: `pm2 stop ukm-ponja-app`
-   **Memulai ulang**: `pm2 restart ukm-ponja-app`

### 6.4. Menjalankan PM2 saat Startup

```bash
pm2 startup
```
Jalankan perintah yang diberikan oleh PM2, lalu simpan daftar proses Anda:
```bash
pm2 save
```
Aplikasi Anda sekarang akan otomatis berjalan setiap kali server dinyalakan.
