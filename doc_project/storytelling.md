# Storytelling Video - User Management Module

## 1. Opening: Masalah yang Diselesaikan
Di banyak bisnis layanan, data customer sering tercecer: ada yang tercatat di satu outlet, tapi tidak sinkron saat owner punya lebih dari satu bisnis. Akibatnya, tim sulit tahu customer ini milik bisnis mana, dan hak akses customer ke setiap bisnis juga tidak jelas.

Modul **User Management** di Antreey dibangun untuk menyelesaikan ini: semua data user terpusat, tapi relasi customer ke tiap bisnis tetap jelas dan bisa dikelola oleh owner.

---

## 2. Konsep Inti Sistem
Sistem memisahkan dua hal penting:

1. **Users**: data identitas user global (nama, email, role, dll).
2. **Membership per bisnis**: relasi apakah user tersebut menjadi customer di bisnis tertentu.

Artinya, satu user bisa:
- hanya jadi customer di bisnis A,
- atau jadi customer di bisnis A dan bisnis B sekaligus,
- semuanya tetap dalam kontrol owner.

---

## 3. Alur Demo yang Disarankan (Urutan Video)

### Scene A - Multi Business Context
- Tunjukkan owner punya dua bisnis (misal: Barbershop A dan Futsal B).
- Switch bisnis dari dropdown di header.
- Jelaskan bahwa semua data di halaman customer mengikuti bisnis aktif.

**Narasi:**
"Di Antreey, owner bisa punya lebih dari satu bisnis. Saat kita ganti bisnis aktif, list customer otomatis berubah sesuai membership customer di bisnis tersebut."

### Scene B - Add New Customer
- Klik **Add New Customer**.
- Isi form customer baru.
- Tunjukkan opsi assign ke bisnis saat create.

**Narasi:**
"Saat menambah customer baru, kita bisa langsung menentukan customer ini masuk ke bisnis mana. Jadi dari awal, membership customer sudah rapi dan terstruktur."

### Scene C - Assign Existing Customer
- Klik **Assign Existing**.
- Pilih customer existing.
- Pilih bisnis target.
- Submit.

**Narasi:**
"Kalau customer sudah ada sebelumnya, kita tidak perlu buat ulang akun. Cukup assign customer existing ke bisnis lain. Ini penting untuk skenario satu owner, banyak bisnis, dan customer yang sama."

### Scene D - Customer Table & Membership Visibility
- Tunjukkan table customer pada bisnis aktif.
- Tunjukkan status membership per customer.
- Jelaskan pagination dan data nyata dari Firestore.

**Narasi:**
"Table customer menampilkan data real dari database dan sudah dilengkapi pagination. Owner dapat memantau customer yang benar-benar menjadi member bisnis aktif."

### Scene E - Edit & Revoke Access
- Buka Edit customer.
- Tampilkan badge bisnis apa saja yang customer ikuti.
- Klik cabut akses di salah satu bisnis.

**Narasi:**
"Di mode edit, owner bisa lihat daftar bisnis tempat customer tergabung, lalu mencabut akses customer dari bisnis tertentu secara granular, tanpa menghapus user secara global."

---

## 4. Fitur Utama yang Bisa Disebut di Video

1. **Role-aware management**
   - Admin bisa melihat semua user.
   - Owner fokus pada customer membership bisnis yang dimiliki.

2. **Multi-business ready**
   - Owner bisa punya banyak bisnis.
   - Customer bisa tergabung ke satu atau banyak bisnis owner.

3. **Dual onboarding flow**
   - Add New Customer (buat akun baru).
   - Assign Existing Customer (pakai akun yang sudah ada).

4. **Granular access control**
   - Revoke membership per bisnis langsung dari edit customer.

5. **Operational UX improvements**
   - Action button lebih ringkas.
   - Pagination customer table aktif dan informatif.

---

## 5. Value Proposition (Closing)
Dengan modul ini, owner tidak lagi mengelola customer secara manual per outlet. Semua terpusat, tetapi kontrol membership tetap detail per bisnis. Hasilnya: operasional lebih rapi, minim duplikasi data, dan siap scale untuk owner dengan banyak unit bisnis.

---

## 6. Script Penutup (Siap Pakai)
"User Management di Antreey bukan cuma CRUD user biasa. Sistem ini memastikan setiap customer punya relasi yang jelas ke bisnis yang tepat, mendukung owner multi-bisnis, dan tetap fleksibel untuk assign maupun revoke akses kapan saja. Ini membuat manajemen customer jadi lebih presisi, aman, dan scalable."

---

## 7. Update Narrative (May 2026)

### A. Global Resource Management
Antreey sekarang punya modul Resource yang bersifat global lintas sektor, bukan hardcoded untuk satu jenis bisnis.

Contoh resource:
- room
- seat
- field
- equipment
- custom

Resource dikelola per bisnis dan mencakup status, kapasitas, serta konfigurasi operasional.

**Narasi video:**
"Sekarang resource di Antreey sudah dibuat netral untuk semua sektor. Jadi mau bisnis olahraga, klinik, salon, atau studio, semua bisa pakai model resource yang sama."

### B. Service to Resource Mapping
Setiap service sekarang bisa dihubungkan ke resource yang relevan.

Contoh:
- Service `Court Rental 60 Minutes` bisa di-map ke resource `Court A/B/C`
- Service `Private Coaching` bisa di-map ke resource `Coach Slot`

**Narasi video:**
"Service di Antreey tidak berdiri sendiri. Kita bisa tentukan service ini memakai resource apa saja, sehingga scheduling lebih akurat dan siap untuk anti bentrok slot."

### C. Business Settings Real Data
Business Settings sudah bukan dummy UI.

Field utama business profile (name, category, description) sekarang:
- load dari Firestore business aktif
- update ke Firestore secara langsung

**Narasi video:**
"Pengaturan bisnis sekarang sudah tersambung penuh ke database. Saat owner ganti profil bisnis aktif, perubahan langsung tersimpan dan siap dipakai modul lain."

### D. Service Distribution from Firestore
Section Service Distribution tetap ditampilkan, namun sekarang sumber datanya dari Firestore.

Metrik yang ditampilkan:
- average service price
- average duration
- total bookings dan kategori service
- booking count per service (distribution list)

Jika data booking belum ada, sistem tetap menampilkan state informatif, bukan angka dummy.

**Narasi video:**
"Walaupun datanya masih awal, dashboard service sudah terhubung ke data booking riil dari Firestore. Jadi metrik akan bertumbuh seiring penggunaan bisnis."

### E. UX Improvements Snapshot
Perbaikan UX terbaru:
- resource modal backdrop full-screen
- konfirmasi edit/delete resource
- urutan resource berdasarkan waktu pembuatan (terbaru dulu)
- customer management flow sudah mendukung assign/revoke membership lintas bisnis owner

**Narasi video:**
"Selain fitur utama, kita juga rapikan pengalaman operasional supaya aman dipakai harian: ada konfirmasi aksi penting, urutan data yang jelas, dan kontrol membership yang granular."

---

## 8. Suggested Closing Update
"Dengan update ini, Antreey tidak hanya punya user management yang matang, tapi juga fondasi operasional bisnis yang siap scale: resource global lintas sektor, mapping service ke resource, settings berbasis data real, dan analytics yang langsung membaca Firestore."
