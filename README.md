# Timer Olahraga ⏱️

Aplikasi Timer Olahraga adalah alat bantu interval training berbasis web untuk mengatur siklus latihan dan istirahat secara otomatis. Proyek ini dibangun menggunakan HTML, CSS, dan Vanilla JavaScript murni tanpa dependensi eksternal.

## Fitur Utama
* **Sistem Interval Kustom**: Pengguna dapat mengatur target waktu total, durasi aktivitas per set, dan waktu istirahat secara spesifik[cite: 2].
* **Umpan Balik Visual**: Dilengkapi dengan *progress bar* animasi untuk waktu utama dan sub-timer, serta kartu fase yang disorot saat aktif (hijau untuk olahraga, ungu untuk istirahat)[cite: 2, 3].
* **Indikator Audio**: Memanfaatkan Web Audio API untuk menghasilkan bunyi hitung mundur di 3 detik terakhir, nada transisi antar fase, dan alarm berkelanjutan saat waktu total habis[cite: 1].
* **Kontrol Sesi Fleksibel**: Menyediakan fungsi untuk menjeda (pause), melanjutkan (resume), dan mengatur ulang (reset) perhitungan kapan saja[cite: 1, 2].
* **Desain Antarmuka Modern**: Mengusung tema gelap (*dark mode*) dengan elemen gradien, tata letak kartu responsif, dan animasi *popup* yang mulus[cite: 3].

## Struktur File
* **`index.html`**: Kerangka utama antarmuka yang memuat panel pengaturan parameter, layar timer ganda, penghitung set, dan *overlay* peringatan penyelesaian[cite: 2].
* **`style.css`**: Pengaturan visual yang mencakup variabel warna tema, tata letak *grid/flexbox*, desain pengisi *progress bar*, dan animasi CSS[cite: 3].
* **`app.js`**: Modul logika yang menangani pengurangan waktu, perpindahan fase otomatis, pembaruan elemen antarmuka, dan mesin sintesis suara[cite: 1].

## Cara Penggunaan
1. Buka https://timer-olahraga-two.vercel.app/.
2. Tentukan "Waktu Total", "Waktu Olahraga", dan "Waktu Istirahat" pada panel pengaturan[cite: 2].
3. Klik tombol **Mulai Sesi** untuk mengaktifkan timer[cite: 2].
4. Ikuti instruksi di layar dan dengarkan peringatan audio untuk mengetahui kapan harus berlatih atau beristirahat[cite: 1].
5. Matikan peringatan dengan menekan tombol **Hentikan Alarm** ketika *popup* muncul di akhir sesi[cite: 2].
