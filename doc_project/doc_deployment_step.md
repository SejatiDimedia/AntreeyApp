# Antreey Deployment Notes

Dokumen ini mencatat langkah deployment Antreey ke Google Cloud Run, termasuk setup billing, build container, konfigurasi Firebase, troubleshooting error yang muncul, dan cara pengecekan setelah deploy.

## 1. Deployment Target

Aplikasi Antreey dideploy sebagai React/Vite static app yang dibungkus dalam Docker container dan dijalankan di Google Cloud Run.

Target utama:

- Google Cloud project: `gen-lang-client-0022008781`
- Cloud Run service: `antreey`
- Region: `asia-southeast2`
- Firestore database ID: `ai-studio-3f804609-c46e-40a7-a6dd-1a6e2048bf56`
- Runtime web server: `nginx`

## 2. File Deployment Yang Ditambahkan

### Dockerfile

File: `Dockerfile`

Fungsi:

- Menggunakan Node.js untuk install dependency dan build React/Vite app.
- Menghasilkan folder `dist`.
- Menggunakan Nginx untuk serve hasil build.
- Mengekspos port `8080`, sesuai kebutuhan Cloud Run.
- Menyediakan default build arg penting seperti `VITE_FIREBASE_DATABASE_ID` dan Cloudinary config.

Kenapa database ID dimasukkan di Dockerfile:

Vite membaca variable `VITE_*` saat build, bukan saat runtime. Jadi kalau `VITE_FIREBASE_DATABASE_ID` tidak tersedia saat Docker image dibuat, production bundle akan fallback ke Firestore database `(default)`.

Project ini tidak memakai database `(default)`, jadi production harus selalu memakai:

```text
ai-studio-3f804609-c46e-40a7-a6dd-1a6e2048bf56
```

### nginx.conf

File: `nginx.conf`

Fungsi:

- Serve file static dari `/usr/share/nginx/html`.
- Mendukung SPA routing React.
- Route seperti `/dashboard`, `/bookings`, `/customer-app`, dan route lain akan fallback ke `index.html`.
- Asset di `/assets/` diberi cache panjang.
- `index.html` diberi `no-cache` agar revision baru lebih cepat terbaca.

### .dockerignore

File: `.dockerignore`

Fungsi:

- Mencegah file tidak perlu ikut dikirim ke Cloud Build.
- Mengabaikan `node_modules`, `dist`, `.git`, `.env`, `.env.*`, log, README, dan `doc_project`.

Catatan penting:

`.env.local` tidak ikut dikirim ke Cloud Build. Ini bagus untuk keamanan, tapi artinya env Vite yang dibutuhkan saat build harus disediakan lewat Docker build arg/default atau mekanisme build lain.

## 3. Firebase Configuration

File: `src/config/firebase.js`

Firestore dibuat dengan database ID named jika `VITE_FIREBASE_DATABASE_ID` tersedia:

```js
export const db = normalizedFirestoreDatabaseId
  ? getFirestore(app, normalizedFirestoreDatabaseId)
  : getFirestore(app);
```

Jika database ID tidak tersedia, Firebase akan memakai database `(default)`.

Error yang muncul jika production bundle salah:

```text
Firestore Database '(default)' not found. Please check your project configuration.
```

Artinya production bundle belum membawa `VITE_FIREBASE_DATABASE_ID` yang benar.

## 4. Setup Google Cloud Project

Cek akun aktif dan project aktif:

```bash
gcloud config list
```

Expected result:

```text
[core]
account = timur7dian84@gmail.com
project = gen-lang-client-0022008781
```

Jika project belum aktif:

```bash
gcloud config set project gen-lang-client-0022008781
```

## 5. Billing Check

Cek apakah project sudah terhubung ke billing:

```bash
gcloud billing projects describe gen-lang-client-0022008781
```

Expected result:

```text
billingAccountName: billingAccounts/014BEE-04B583-833637
billingEnabled: true
projectId: gen-lang-client-0022008781
```

Arti output:

- `billingEnabled: true` berarti project sudah bisa memakai layanan seperti Cloud Run, Cloud Build, dan Artifact Registry.
- Biaya akan masuk ke billing account yang terhubung ke project.
- Jika billing account memiliki credit trial, pemakaian akan memotong credit tersebut terlebih dahulu.

Cek billing account:

```bash
gcloud billing accounts describe 014BEE-04B583-833637
```

## 6. Enable Required Services

Aktifkan service yang dibutuhkan:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

Service yang diaktifkan:

- `run.googleapis.com`: Cloud Run
- `cloudbuild.googleapis.com`: Cloud Build
- `artifactregistry.googleapis.com`: Artifact Registry untuk menyimpan container image

Jika muncul error billing, pastikan project sudah link ke billing account dan `billingEnabled: true`.

## 7. Local Build Check

Sebelum deploy, pastikan build lokal berhasil:

```bash
npm run build
```

Expected result:

```text
built successfully
```

Warning chunk size dari Vite masih aman untuk tahap ini. Itu bukan penyebab deploy gagal.

Untuk memastikan bundle membawa database ID yang benar:

```bash
rg "ai-studio-3f804609-c46e-40a7-a6dd-1a6e2048bf56|\\(default\\)" dist/assets dist/index.html -n
```

Jika yang muncul adalah database ID named, berarti build sudah benar.

## 8. Deploy To Cloud Run

Command deploy yang digunakan:

```bash
gcloud run deploy antreey \
  --source . \
  --region asia-southeast2 \
  --allow-unauthenticated
```

Yang terjadi saat command ini dijalankan:

1. Source code dikirim ke Cloud Build.
2. Cloud Build membaca `Dockerfile`.
3. Dependency diinstall dengan `npm install`.
4. App dibuild dengan `npm run build`.
5. Hasil build dimasukkan ke image Nginx.
6. Container image disimpan di Artifact Registry.
7. Cloud Run membuat revision baru.
8. Traffic diarahkan ke revision terbaru.
9. Website bisa diakses publik.

## 9. Cloud Run URL

Cek URL service:

```bash
gcloud run services describe antreey \
  --region asia-southeast2 \
  --format="value(status.url)"
```

Contoh URL:

```text
https://antreey-498809238217.asia-southeast2.run.app
```

## 10. Firebase Auth Authorized Domain

Setelah Cloud Run URL aktif, tambahkan domain Cloud Run ke Firebase Auth.

Error/warning yang muncul jika belum ditambahkan:

```text
The current domain is not authorized for OAuth operations.
```

Langkah:

1. Buka Firebase Console.
2. Pilih project `gen-lang-client-0022008781`.
3. Masuk ke `Authentication`.
4. Masuk ke `Settings`.
5. Buka tab `Authorized domains`.
6. Tambahkan domain Cloud Run tanpa `https://`.

Contoh:

```text
antreey-498809238217.asia-southeast2.run.app
```

## 11. Firestore Rules Deployment

Deploy rules Firestore:

```bash
firebase deploy --only firestore:rules --project gen-lang-client-0022008781
```

Expected result:

```text
firestore.rules compiled successfully
released rules firestore.rules to cloud.firestore
Deploy complete!
```

Catatan:

Rules harus mendukung akses owner, admin, staff, customer membership, bookings, services, resources, dan payment proof update sesuai flow aplikasi.

## 12. Common Errors And Fixes

### Error: Database `(default)` not found

Log:

```text
Firestore Database '(default)' not found. Please check your project configuration.
```

Penyebab:

Production bundle dibuild tanpa `VITE_FIREBASE_DATABASE_ID`, sehingga Firebase mencoba akses database `(default)`.

Fix:

- Pastikan `Dockerfile` punya default:

```dockerfile
ARG VITE_FIREBASE_DATABASE_ID=ai-studio-3f804609-c46e-40a7-a6dd-1a6e2048bf56
ENV VITE_FIREBASE_DATABASE_ID=$VITE_FIREBASE_DATABASE_ID
```

- Rebuild dan redeploy Cloud Run.
- Hard refresh browser atau buka incognito.

### Error: Build failed

Jika Cloud Run deploy gagal di tahap build:

```text
Build failed; check build logs for details
```

Langkah cek:

1. Buka link Cloud Build logs dari terminal.
2. Cari error paling bawah.
3. Jalankan build lokal:

```bash
npm run build
```

Catatan dari proses ini:

- Dockerfile memakai `npm install`, bukan `npm ci`, karena lockfile/dependency sempat bermasalah saat build.

### Error: Billing account not found

Log:

```text
Billing account for project is not found
```

Penyebab:

Project belum terhubung ke billing account.

Fix:

- Link project ke billing account dari Google Cloud Console.
- Pastikan:

```bash
gcloud billing projects describe gen-lang-client-0022008781
```

menghasilkan:

```text
billingEnabled: true
```

### Warning: OAuth domain not authorized

Log:

```text
The current domain is not authorized for OAuth operations.
```

Fix:

Tambahkan Cloud Run domain ke Firebase Auth Authorized domains.

### `net::ERR_BLOCKED_BY_CLIENT`

Contoh:

```text
net::ERR_BLOCKED_BY_CLIENT
```

Biasanya disebabkan browser extension seperti ad blocker/privacy blocker. Ini bukan root cause Firestore database error.

Jika ingin memastikan, coba buka app dengan Incognito atau browser tanpa extension.

## 13. Dashboard Checks

### Cloud Run Dashboard

Link:

```text
https://console.cloud.google.com/run
```

Pastikan project aktif:

```text
gen-lang-client-0022008781
```

Buka service:

```text
antreey
```

Tab yang perlu dicek:

- `Revisions`: melihat revision terbaru dan status deploy.
- `Logs`: melihat error runtime.
- `Metrics`: melihat request, latency, dan error rate.
- `Networking`: melihat public URL.
- `Security`: memastikan akses publik jika app memang ingin public.

### Cloud Build Logs

Link:

```text
https://console.cloud.google.com/cloud-build/builds
```

Gunakan ini kalau deploy gagal saat build container.

### Artifact Registry

Link:

```text
https://console.cloud.google.com/artifacts
```

Fungsi:

- Melihat image container yang dibuat dari deploy.
- Image lama bisa menumpuk dan berpotensi menambah storage cost.

### Billing Reports

Link:

```text
https://console.cloud.google.com/billing
```

Yang perlu dipantau:

- Cloud Run
- Cloud Build
- Artifact Registry
- Firestore
- Firebase Authentication

## 14. Terminal Checks After Deploy

Cek service detail:

```bash
gcloud run services describe antreey \
  --region asia-southeast2
```

Cek URL:

```bash
gcloud run services describe antreey \
  --region asia-southeast2 \
  --format="value(status.url)"
```

Cek logs:

```bash
gcloud run services logs read antreey \
  --region asia-southeast2 \
  --limit 50
```

Cek revisions:

```bash
gcloud run revisions list \
  --service antreey \
  --region asia-southeast2
```

## 15. Cost Safety

Untuk mengurangi risiko billing, set minimum instance ke `0`:

```bash
gcloud run services update antreey \
  --region asia-southeast2 \
  --min-instances 0
```

Artinya Cloud Run tidak menjaga instance tetap hidup saat tidak ada request.

Yang bisa memunculkan biaya:

- Deploy ulang dengan `gcloud run deploy --source .`
- Cloud Build saat build image
- Artifact Registry menyimpan image
- Cloud Run menerima request
- Firestore read/write/listen
- Cloudinary upload jika melewati free tier

Yang tidak memunculkan biaya Google Cloud secara langsung:

- Edit code lokal
- `npm run dev` secara lokal
- `npm run build` secara lokal

Namun, app lokal tetap connect ke Firebase production jika tidak memakai emulator/dev project. Jadi read/write Firestore dari local app tetap memakai Firestore production.

## 16. Development Notes

Saat ini app lokal masih memakai Firebase production:

```text
gen-lang-client-0022008781
```

Dan database:

```text
ai-studio-3f804609-c46e-40a7-a6dd-1a6e2048bf56
```

Ini masih aman untuk tahap testing selama:

- Data masih data testing.
- User asli belum banyak.
- Tidak menjalankan script mass update/delete.
- Tidak spam refresh halaman yang punya banyak Firestore listener.
- Billing dipantau berkala.

Untuk jangka panjang, opsi yang lebih aman:

1. Firebase Emulator untuk development lokal.
2. Firebase project khusus development.
3. Production project hanya untuk data real.

## 17. Recommended Deployment Checklist

Sebelum deploy:

1. Jalankan `npm run build`.
2. Pastikan tidak ada error build.
3. Pastikan `Dockerfile` punya `VITE_FIREBASE_DATABASE_ID` yang benar.
4. Pastikan Firestore rules sudah sesuai.
5. Pastikan billing aktif.

Saat deploy:

```bash
gcloud run deploy antreey \
  --source . \
  --region asia-southeast2 \
  --allow-unauthenticated
```

Setelah deploy:

1. Buka Cloud Run URL.
2. Login owner.
3. Cek dashboard membaca Firestore.
4. Login customer.
5. Cek `customer-app` membaca business/service.
6. Cek booking flow.
7. Cek Cloud Run logs.
8. Cek Billing Reports.
9. Jika auth error, cek Firebase Auth Authorized domains.
10. Jika Firestore error `(default)`, berarti production bundle belum membawa named database ID.

## 18. Important Reminder

Jika memakai fitur Cloud Run `Deploy one revision from an existing container image`, image yang dipilih harus image yang sudah dibuild dari source terbaru.

Jika image lama dipakai ulang, perubahan source code, Dockerfile, atau env build tidak akan masuk.

Untuk perubahan React/Vite, biasanya lebih aman deploy ulang dari source:

```bash
gcloud run deploy antreey \
  --source . \
  --region asia-southeast2 \
  --allow-unauthenticated
```
