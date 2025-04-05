# 💠 Backend Starter

Starter kit untuk membangun layanan backend API menggunakan **Node.js** dan **TypeScript**. Proyek ini dirancang dengan arsitektur berbasis kelas yang bersih dan modular, memudahkan pengembangan dan pemeliharaan aplikasi backend yang scalable.

---

## 🚀 Tech Stack

- ⚙️ **Node.js** dengan **Express.js**
- 🦾 **TypeScript** (mode ketat, hanya OOP berbasis kelas)
- 🦪 **Supabase** (melalui RPC atau REST)
- 📦 **pnpm** untuk manajemen dependensi
- 📁 Struktur folder modular dengan dekorator
- 🌐 **CORS**, **dotenv**, alias path, pemisahan environment (`.env.development` / `.env.production`)

---

## 📁 Struktur Folder

Struktur folder proyek ini dirancang untuk memisahkan concern dan meningkatkan keterbacaan kode:

```
backend-starter/
├── src/
│   ├── controllers/      # Logika kontroler
│   ├── services/         # Logika bisnis
│   ├── repositories/     # Interaksi dengan database
│   ├── models/           # Definisi model dan entitas
│   ├── routes/           # Definisi rute aplikasi
│   ├── middlewares/      # Middleware kustom
│   ├── utils/            # Utilitas dan helper
│   ├── config/           # Konfigurasi aplikasi
│   └── index.ts          # Entry point aplikasi
├── test/                 # Unit dan integrasi testing
├── .env.development      # Variabel environment untuk pengembangan
├── .env.production       # Variabel environment untuk produksi
├── .eslintrc.js          # Konfigurasi ESLint
├── .prettierrc           # Konfigurasi Prettier
├── package.json          # File konfigurasi npm
├── tsconfig.json         # Konfigurasi TypeScript
└── README.md             # Dokumentasi proyek
```

---

## 🛠️ Fitur Utama

- **Arsitektur Modular**: Memisahkan logika aplikasi ke dalam controller, service, dan repository untuk meningkatkan maintainability dan testability.
- **TypeScript**: Memanfaatkan fitur TypeScript untuk penulisan kode yang lebih aman dan terstruktur.
- **Manajemen Konfigurasi**: Menggunakan file `.env` untuk memisahkan konfigurasi berdasarkan environment.
- **CORS**: Dukungan Cross-Origin Resource Sharing untuk keamanan aplikasi.
- **Alias Path**: Memudahkan impor modul dengan menggunakan alias path yang telah dikonfigurasi.
- **Supabase Integration**: Terintegrasi dengan Supabase untuk kebutuhan database, melalui RPC atau REST.

---

## 🚀 Instalasi dan Penggunaan

1. **Kloning Repository**:

   ```bash
   git clone https://github.com/ivandj0h/backend-starter.git
   ```

2. **Masuk ke Direktori Proyek**:

   ```bash
   cd backend-starter
   ```

3. **Instal Dependensi**:

   Pastikan Anda telah menginstal `pnpm`. Jika belum, instal terlebih dahulu:

   ```bash
   npm install -g pnpm
   ```

   Kemudian, instal dependensi proyek:

   ```bash
   pnpm install
   ```

4. **Konfigurasi Environment**:

   Buat file `.env.development` dan `.env.production` berdasarkan kebutuhan Anda, dengan merujuk pada file `.env.example` jika tersedia.

5. **Menjalankan Aplikasi**:

   Untuk menjalankan aplikasi dalam mode pengembangan:

   ```bash
   pnpm dev
   ```

   Untuk membangun dan menjalankan aplikasi dalam mode produksi:

   ```bash
   pnpm build
   pnpm start
   ```

---

## 🧪 Testing

Proyek ini dilengkapi dengan unit dan integrasi testing menggunakan framework pilihan Anda. Untuk menjalankan testing:

```bash
pnpm test
```

---

## 🤝 Kontribusi

Kontribusi sangat dihargai! Silakan fork repository ini dan buat pull request dengan perubahan yang Anda usulkan. Pastikan untuk mengikuti standar kode yang telah ditetapkan dan sertakan deskripsi yang jelas pada setiap pull request.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

## 🎉 Kredit

Proyek ini dikembangkan oleh [ivandjoh](https://github.com/ivandjoh).

---

