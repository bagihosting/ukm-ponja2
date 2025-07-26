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

**LANGKAH INI SANGAT PENTING.** Aplikasi ini memerlukan kredensial dari Firebase dan Google AI agar dapat berfungsi. Tanpa ini, fitur penyimpanan data dan AI tidak akan berjalan.

1.  **Buat Berkas `.env`**:
    Di dalam direktori utama proyek Anda, buat sebuah berkas baru bernama `.env`.
    ```bash
    touch .env
    ```
    Salin konten dari berkas `.env.example` (jika ada) atau gunakan templat di bawah.

2.  **Isi Kredensial Firebase**:
    Buka berkas `.env` dan isi variabel berikut dengan kredensial dari proyek Firebase Anda:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="proyek-anda.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="proyek-anda"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="proyek-anda.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="12345..."
    NEXT_PUBLIC_FIREBASE_APP_ID="1:12345...:web:..."
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-..."
    ```
    Anda dapat menemukan nilai-nilai ini di **Firebase Console** -> **Project Settings** -> **General** -> **Your apps** -> **Firebase SDK snippet** -> **Config**.

3.  **Isi Kunci API Google AI**:
    Tambahkan kunci API untuk Google AI ke dalam berkas `.env`. Kunci ini diperlukan untuk fitur pembuatan gambar dan AI Dokter.
    ```
    GEMINI_API_KEY="AIza..."
    ```
    Anda bisa mendapatkan kunci ini dari [Google AI Studio](https://aistudio.google.com/app/apikey).

Pastikan berkas `.env` ini ada di server tempat Anda menjalankan aplikasi.

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

Aplikasi akan berjalan dan dapat diakses di `http://localhost:3002`.

Server pengembangan ini menggunakan *hot-reloading*, yang berarti setiap perubahan pada kode akan secara otomatis memuat ulang aplikasi di peramban Anda.

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
