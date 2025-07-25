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

Aplikasi ini memerlukan kredensial dari Firebase dan Google AI (untuk fitur Genkit) agar dapat berfungsi.

1.  **Buat Berkas `.env`**:
    Salin konten dari berkas `.env` yang sudah ada (atau buat berkas baru jika tidak ada) dan pastikan berkas tersebut bernama `.env`.

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
    Tambahkan kunci API untuk Google AI ke dalam berkas `.env`. Kunci ini diperlukan untuk fitur pembuatan gambar AI.
    ```
    GEMINI_API_KEY="AIza..."
    ```
    Anda bisa mendapatkan kunci ini dari [Google AI Studio](https://aistudio.google.com/app/apikey).

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
