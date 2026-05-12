# Product Requirements Document (PRD) — Antreey

## 1. Executive Summary
*   **Project Name:** Antreey
*   **Tagline:** "Smart Queueing for Smarter UMKM"
*   **Tech Stack:** React (Vite), Firebase (Firestore & Auth), Gemini 2.5 Flash, Tailwind CSS.
*   **Architecture:** Repository Pattern with Centralized Design Tokens.

## 2. Background & Problem
UMKM di Indonesia masih menghadapi kendala antrean manual yang menyebabkan:
1. Penumpukan pelanggan yang tidak teratur di lokasi fisik.
2. Tingginya angka *no-show* yang merugikan pemilik bisnis.
3. Ketidakpastian estimasi waktu tunggu bagi pelanggan.
4. Kurangnya data operasional untuk evaluasi performa bisnis.

## 3. Technical Architecture
### 3.1. Frontend Core
*   **Build Tool:** Vite (Fast Refresh & Optimized Build).
*   **State Management:** React Context API (Auth, Global Queue State).
*   **Real-time Layer:** Firebase `onSnapshot` yang di-wrap dalam custom hooks untuk sinkronisasi antrean *zero-refresh*.

### 3.2. Centralized UI Styling (Stitch to Tailwind)
Sistem styling dipusatkan agar sinkron dengan desain dari **Stitch**:
*   **Design Token Mapping:** Semua nilai warna, radius, dan spacing dari Stitch dipindahkan ke dalam `tailwind.config.js`.
*   **Semantic Classes:** Menggunakan penamaan kelas berdasarkan fungsi (contoh: `bg-brand-primary`, `text-queue-number`) sehingga perubahan tema global tidak memerlukan perubahan di level komponen.

## 4. Core Features (MVP Scope)

### 4.1. Smart Booking & AI Slot Recommendation
*   **Fungsi:** Pelanggan memilih layanan dan jam booking.
*   **AI Enhancement (Gemini 2.5 Flash):** Memberikan rekomendasi waktu terbaik untuk menghindari jam sibuk berdasarkan tren data historis.

### 4.2. Real-time Queue Dashboard
*   **Fungsi:** Sinkronisasi nomor antrean secara instan antara Admin (Merchant) dan User (Customer).
*   **Backend:** Firebase Firestore Snapshots (Data terupdate otomatis di seluruh perangkat).

### 4.3. AI Waiting Time Prediction
*   **Logika:** Gemini AI menghitung estimasi waktu tunggu secara dinamis dengan mempertimbangkan jumlah antrean, rata-rata durasi layanan, dan variabel operasional lainnya.

### 4.4. AI Anti No-Show System
*   **Fungsi:** Analisis perilaku pelanggan untuk memprediksi risiko pembatalan dan memberikan notifikasi konfirmasi lebih awal bagi user berisiko tinggi.

## 5. Implementation Task Roadmap

| Phase | Task | Focus |
| :--- | :--- | :--- |
| **1. Foundation** | Setup Vite, Tailwind Config (Base on Stitch), & Firebase Auth | Global Styles & Security |
| **2. Architecture** | Repository Layer (Firestore) & Database Schema | Data Flow & Real-time |
| **3. AI Logic** | Integration Gemini 2.5 Flash for Prediction & NLP | Intelligence |
| **4. UI Conversion** | Slicing Stitch Design to React Components | Visual Consistency |
| **5. Dashboard** | Merchant Control Panel & Analytics Insight | Operational Control |

## 6. UI/UX Principles
*   **Mobile-First:** Fokus utama pada kemudahan akses via smartphone.
*   **Centralized Truth:** Semua variabel brand (warna/font) wajib didefinisikan di `tailwind.config.js`. Tidak diperbolehkan menggunakan *hardcoded hex colors* di dalam file JSX.
*   **High Contrast:** Informasi nomor antrean dan status harus terlihat menonjol sesuai spesifikasi desain.

## 7. Future Roadmap
*   Integrasi Payment Gateway untuk uang muka (DP).
*   Sistem Loyalitas (Point & Reward) bagi pelanggan setia.
*   Dukungan multi-cabang (Multi-branch support) untuk bisnis franchise.

---
*Created by Timur Dian Radha Sejati — Sejati Dimedia*