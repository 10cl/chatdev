<p align="center">
    <img src="./screenshots/chatgpt_architecture.svg">
</p>
<h1 align="center">ChatDev: Visualisasikan Agen AI Anda</h1>

<div align="center">

[![author][author-image]][author-url]
[![license][license-image]][license-url]
[![release][release-image]][release-url]
[![last commit][last-commit-image]][last-commit-url]

[Inggris](README.md) &nbsp;&nbsp;|&nbsp;&nbsp; Indonesia &nbsp;&nbsp;|&nbsp;&nbsp; [简体中文](README_ZH-CN.md) &nbsp;&nbsp;|&nbsp;&nbsp; [繁體中文](README_ZH-TW.md) &nbsp;&nbsp;|&nbsp;&nbsp; [日本語](README_JA.md)
##

### ⚡️ Instalasi

<a href="https://chrome.google.com/webstore/detail/chatdev-visualize-your-ai/dopllopmmfnghbahgbdejnkebfcmomej?utm_source=github"><img src="https://user-images.githubusercontent.com/64502893/231991498-8df6dd63-727c-41d0-916f-c90c15127de3.png" width="200" alt="Dapatkan ChatDev untuk Chromium"></a>

##

[Tangkapan Layar](#-tangkapan-layar) &nbsp;&nbsp;|&nbsp;&nbsp; [Fitur](#-fitur) &nbsp;&nbsp;|&nbsp;&nbsp; [Bots](#-bots) &nbsp;&nbsp;|&nbsp;&nbsp; [Instalasi](#-instalasi) &nbsp;&nbsp;|&nbsp;&nbsp; [Catatan Perubahan](#-catatan-perubahan)

[author-image]: https://img.shields.io/badge/author-10cl-blue.svg
[author-url]: https://github.com/10cl
[license-image]: https://img.shields.io/github/license/10cl/chatdev?color=blue
[license-url]: https://github.com/10cl/chatdev/blob/main/LICENSE
[release-image]: https://img.shields.io/github/v/release/10cl/chatdev?color=blue
[release-url]: https://github.com/10cl/chatdev/releases/latest
[last-commit-image]: https://img.shields.io/github/last-commit/10cl/chatdev?label=terakhir%20kali%20diubah
[last-commit-url]: https://github.com/10cl/chatdev/commits

</div>

**ChatDev** adalah ekstensi **Chrome** yang kuat yang mengintegrasikan antarmuka model bahasa besar yang beragam untuk memberikan pengalaman percakapan yang berbeda. Dengan kustomisasi visual dari urutan tugas Prompt-Flow, Anda tidak hanya dapat menjelajahi kinerja model besar yang berbeda dalam permainan, tetapi juga membuat aliran eksekusi tugas Anda sendiri. Berinteraksi dengan NPC virtual untuk memperkaya pengalaman Anda dan ciptakan kenangan unik Anda di kota AI dengan memilih model besar pilihan Anda.

## 📷 Tangkapan Layar
![game-prompt-flow.png](./screenshots/game-prompt-flow.png)
![chat-prompt-flow.gif](./screenshots/chat-prompt-flow.gif)

## ✨ Fitur
* Gunakan berbagai chatbot dalam satu aplikasi, yang saat ini mendukung ChatGPT, Bing Chat baru, Google Bard, Claude, dan lebih dari 10 model sumber terbuka.
* Memanggil antarmuka model besar di peramban dalam bentuk Webapis tanpa kemampuan kode
* Berinteraksi dengan NPC dalam bentuk permainan dan membahas kebutuhan nyata
* Sesuaikan definisi peran NPC
* Sesuaikan perilaku NPC dan rencanakan Prompt
* Sesuaikan Aliran Prompt
* Setelah Aliran Prompt diaktifkan, sampaikan kebutuhan Anda dalam satu kalimat, dan NPC akan dipilih secara otomatis untuk membentuk tim, menyelesaikan misi, dan mempresentasikannya dalam gaya permainan interaktif.

## 🤖 Bots
Dukungan ChatGPT & iFlytek Spark & Bing & Bard & Claude & ChatGLM & Alpaca & Vicuna & Koala & Dolly & LLaMA & StableLM & OpenAssistant & ChatRWKV...

## 🔨 Instalasi

### 1. Instalasi dari Chrome Web Store

Cari [ChatDev](https://chrome.google.com/webstore/detail/chatdev/dopllopmmfnghbahgbdejnkebfcmomej) di [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) dan klik "Instal."

### 2. Instalasi Manual

1. Unduh `chatdev1.1.1.zip` dari halaman Rilis.
2. Ekstrak file-file tersebut.
3. Di Chrome/Edge, buka halaman ekstensi (`chrome://extensions` atau `edge://extensions`).
4. Aktifkan mode pengembang.
5. Seret dan lepaskan folder yang diekstraksi ke halaman untuk mengimpor (jangan menghapus folder setelah diimpor).

### 3. Bangun dari Kode Sumber

* Klon kode sumber.
* Jalankan `yarn install` untuk menginstal dependensi.
* Jalankan `yarn build` untuk membangun plugin.
* Ikuti langkah-langkah di "Instalasi Manual" untuk memuat folder `dist` ke peramban Anda.

## 📜 Catatan Perubahan
* v1.1.1

    * Aliran Prompt ganda-klik pada node yang dapat diedit
    * Impor atau ekspor semua konfigurasi
    * Berbagi perpustakaan Prompt
* v1.1.0

    * Dukungan untuk beberapa model bahasa besar
    * Kustomisasi peran pengguna
    * Dukungan untuk Prompt kustom (tindakan, rencana, dll.)
    * Penyuntingan visual baru untuk Aliran Prompt kustom
    * Dukungan untuk beralih antara tampilan obrolan dan tampilan permainan
    * Aliran Prompt predefinisi, memungkinkan permintaan satu kalimat untuk secara otomatis memilih NPC, membentuk tim, mengeksekusi tugas, dan menyajikannya dalam gaya permainan interaktif.
    * Tombol Pengaturan untuk menyesuaikan API dan memilih model yang diinginkan
    * Masalah API yang diperbaiki dengan model iFlytek Spark
* v1.0.1

    * Menambahkan dukungan untuk model bahasa besar kognitif iFlytek Spark
* v1.0.0

    * Rilis awal plugin kota AI berdasarkan ChatGPT

## 🤝 Penghargaan

Kami mengucapkan terima kasih kepada proyek-proyek berikut atas inspirasi dan referensi yang mereka berikan: [generative_agents](https://github.com/joonspk-research/generative_agents)、[chathub](https://github.com/chathub-dev/chathub)

Apakah Anda ingin menjelajahi keajaiban berbagai model bahasa besar atau membuat kehidupan kota virtual Anda sendiri, ChatDev akan menjadi asisten yang andal. Pasang sekarang dan mulai menjelajahi!
