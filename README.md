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

**LANGKAH INI SANGAT PENTING.** Aplikasi ini memerlukan dua set kredensial: satu untuk **klien** (berprefik `NEXT_PUBLIC_`) dan satu untuk **server** (berprefik `FIREBASE_ADMIN_`). Tanpa ini, fitur-fitur penting seperti login, penyimpanan data, dan AI tidak akan berjalan.

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
    FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

    # --- Kunci API Google AI ---
    GEMINI_API_KEY="AIza..."
    ```

### 3.1. Mendapatkan Kredensial Klien (NEXT_PUBLIC_*)

Nilai-nilai ini aman untuk diekspos di browser.
1. Buka **Firebase Console**.
2. Klik ikon gerigi (⚙️) di sebelah "Project Overview" dan pilih **Project settings**.
3. Di tab **General**, di bawah **Your apps**, pilih aplikasi web Anda.
4. Di bagian **Firebase SDK snippet**, pilih **Config**.
5. Salin nilai-nilai yang sesuai ke dalam variabel `NEXT_PUBLIC_*` di berkas `.env` Anda.

### 3.2. Mendapatkan Kredensial Admin Server (FIREBASE_ADMIN_*)

Nilai-nilai ini **SANGAT RAHASIA** dan hanya boleh digunakan di server. **JANGAN PERNAH** membagikannya di sisi klien.
1. Buka **Firebase Console** -> **Project settings**.
2. Navigasi ke tab **Service accounts**.
3. Klik tombol **Generate new private key**. Sebuah file JSON akan terunduh secara otomatis.
4. **Buka file JSON** yang baru saja diunduh menggunakan editor teks.
5. Salin nilai-nilai dari file JSON ke dalam berkas `.env` Anda:
   - Salin nilai dari `"client_email"` ke `FIREBASE_ADMIN_CLIENT_EMAIL`.
   - Salin seluruh nilai dari `"private_key"` (termasuk `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`) ke `FIREBASE_ADMIN_PRIVATE_KEY`.
   - Nilai untuk `NEXT_PUBLIC_FIREBASE_PROJECT_ID` juga tersedia di file ini sebagai `"project_id"`.

### 3.3. Mendapatkan Kunci API Google AI (GEMINI_API_KEY)

Kunci ini diperlukan untuk fitur AI seperti Tanya Dokter dan pembuatan gambar.
1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Buat kunci API baru dan salin nilainya ke `GEMINI_API_KEY` di berkas `.env` Anda.

## 4. Konfigurasi Firebase Authentication

Agar fitur login berfungsi, Anda harus mengaktifkan metode **Email/Password** di Firebase Authentication.

1.  Buka **Firebase Console**.
2.  Navigasi ke **Authentication** -> **Sign-in method**.
3.  Pilih **Email/Password** dan aktifkan.
4.  Buat setidaknya satu pengguna di tab **Users** agar Anda dapat login ke dasbor.

## 5. Menjalankan Aplikasi

Setelah semua konfigurasi selesai, jalankan server pengembangan:

```bash
npm run dev
```

Aplikasi akan berjalan dan dapat diakses di `http://localhost:3002`. Setiap perubahan pada kode akan secara otomatis memuat ulang aplikasi di peramban Anda.

## 6. Menjalankan Aplikasi di Latar Belakang dengan PM2 (Opsional)

Untuk menjalankan aplikasi secara persisten di latar belakang (misalnya di server produksi), disarankan menggunakan manajer proses seperti `pm2`.

### 6.1. Instalasi PM2

Jalankan perintah berikut untuk menginstal PM2 secara global:

```bash
sudo npm install pm2 -g
```

### 6.2. Menjalankan Aplikasi dengan PM2

1.  **Build Aplikasi untuk Produksi**:
    Sebelum menjalankan dengan PM2, Anda harus membuat build produksi dari aplikasi Next.js Anda.

    ```bash
    npm run build
    ```

2.  **Jalankan Aplikasi**:
    Gunakan PM2 untuk menjalankan skrip `start` dari `package.json`. Perintah ini akan menjalankan aplikasi di latar belakang dan memberinya nama `ukm-ponja-app`.

    ```bash
    pm2 start npm --name "ukm-ponja-app" -- run start
    ```
    Aplikasi Anda sekarang berjalan di port 3002 di latar belakang.

### 6.3. Mengelola Aplikasi dengan PM2

Berikut adalah beberapa perintah dasar untuk mengelola aplikasi Anda dengan PM2:

-   **Melihat status semua aplikasi**:
    ```bash
    pm2 list
    ```

-   **Melihat log aplikasi**:
    ```bash
    pm2 logs ukm-ponja-app
    ```

-   **Menghentikan aplikasi**:
    ```bash
    pm2 stop ukm-ponja-app
    ```

-   **Memulai ulang aplikasi**:
    ```bash
    pm2 restart ukm-ponja-app
    ```

### 6.4. Menjalankan PM2 saat Startup

Agar PM2 secara otomatis memulai ulang aplikasi Anda setelah server reboot, jalankan perintah berikut:

```bash
pm2 startup
```

PM2 akan memberikan Anda sebuah perintah untuk dijalankan. Salin dan jalankan perintah tersebut (biasanya memerlukan `sudo`). Setelah itu, simpan daftar proses Anda saat ini:

```bash
pm2 save
```

Sekarang, aplikasi Anda akan otomatis berjalan setiap kali server dinyalakan.
