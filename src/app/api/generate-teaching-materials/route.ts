import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface FormData {
  schoolName: string
  subject: string
  topic: string
  cp: string
  hours: string
  studentCharacteristics: string
  teacherMode: 'beginner' | 'advanced'
}

const getSubjectName = (subject: string): string => {
  const subjects: Record<string, string> = {
    'bahasa-indonesia': 'Bahasa Indonesia',
    'matematika': 'Matematika',
    'ppkn': 'PPKn',
    'sbdp': 'Seni Budaya dan Prakarya',
    'pjok': 'PJOK'
  }
  return subjects[subject] || subject
}

const generateSystemPrompt = (type: string, data: FormData): string => {
  const subjectName = getSubjectName(data.subject)
  const modeGuide = data.teacherMode === 'beginner'
    ? 'Berikan panduan yang sangat detail, langkah demi langkah, dengan penjelasan yang mudah dipahami. Sertakan contoh konkret dan tips praktis.'
    : 'Berikan panduan yang komprehensif namun ringkas dan fleksibel. Fokus pada esensi dan poin-poin kunci yang dapat dikembangkan.'

  const baseInfo = `
KONTEKS:
- Satuan Pendidikan: ${data.schoolName}
- Jenjang: SD Kelas 1
- Semester: 2
- Mata Pelajaran: ${subjectName}
- Topik/Tema: ${data.topic}
- Capaian Pembelajaran: ${data.cp}
- Jumlah Jam: ${data.hours}
- Karakteristik Siswa: ${data.studentCharacteristics}

PRINSIP DEEP LEARNING YANG WAJIB DITERAPKAN:
1. Berpusat pada peserta didik - aktivitas harus melibatkan siswa secara aktif
2. Bermakna dan kontekstual dengan kehidupan sehari-hari anak kelas 1
3. Mengembangkan 4C: Critical Thinking, Communication, Collaboration, Creativity
4. Menguatkan Profil Pelajar Pancasila:
   - Beriman, bertakwa kepada Tuhan YME, dan berakhlak mulia
   - Berkebinekaan global
   - Gotong royong
   - Mandiri
   - Bernalar kritis
   - Kreatif
5. Menggunakan pendekatan: bermain, eksplorasi, diskusi sederhana, dan refleksi
6. Bahasa: sederhana, ramah anak, mudah dipahami

${modeGuide}
`

  const typePrompts: Record<string, string> = {
    atp: `Anda adalah ahli kurikulum SD yang spesialis dalam Kurikulum Merdeka.
Tugas: Buat Alur Tujuan Pembelajaran (ATP) untuk ${subjectName} Kelas 1 Semester 2.

${baseInfo}

FORMAT OUTPUT ATP:
1. Fase dan Tujuan Pembelajaran
   - Sebutkan fase (A: Bermain sambil belajar) dan subfase yang sesuai
   - Tujuan pembelajaran spesifik untuk topik ini (maksimal 3-5 tujuan)

2. Tujuan Pembelajaran Spesifik
   - Setiap tujuan harus: SMART (Spesifik, Terukur, Dapat dicapai, Relevan, Terukur waktu)
   - Menggunakan kata kerja operasional yang sesuai TK A (mengamati, meniru, menceritakan, menyebutkan, dll)
   - Terkait langsung dengan CP yang diberikan

3. Materi Pokok
   - Materi yang akan diajarkan untuk mencapai tujuan
   - Dibagi menjadi sub-sub materi yang logis dan sesuai usia anak

4. Pencapaian Profil Pelajar Pancasila
   - Sebutkan elemen profil yang akan dikembangkan
   - Hubungkan dengan kegiatan pembelajaran

Tulis dengan bahasa Indonesia yang baik dan benar, namun mudah dipahami guru SD.`,

    modul_ajar: `Anda adalah ahli pedagogi SD yang spesialis pembelajaran Deep Learning.
Tugas: Buat Modul Ajar Deep Learning untuk ${subjectName} Kelas 1 Semester 2.

${baseInfo}

FORMAT OUTPUT MODUL AJAR:
1. Informasi Umum
   - Satuan Pendidikan, Kelas, Semester
   - Mata Pelajaran, Topik/Tema
   - Alokasi Waktu

2. Profil Peserta Didik
   - Karakteristik umum siswa kelas 1
   - Kebutuhan belajar berdasarkan input yang diberikan

3. Tujuan Pembelajaran
   - Tujuan pembelajaran (3-5 tujuan)
   - Pencapaian Profil Pelajar Pancasila yang ditargetkan

4. Pemahaman Bermakna
   - Konsep dasar yang harus dipahami siswa
   - Kaitkan dengan pengalaman sehari-hari anak

5. Pertanyaan Pemantik
   - Pertanyaan yang memicu rasa ingin tahu anak
   - Pertanyaan terbuka yang mendorong berpikir

6. Kegiatan Pembelajaran (Deep Learning Approach)
   a. Kegiatan Pendahuluan (10-15 menit)
      - Apersepsi dan motivasi
      - Bermain atau ice breaking yang relevan
      - Pengaitan dengan pengalaman anak

   b. Kegiatan Inti (${data.hours} x 30 menit)
      - Bermain dan eksplorasi (sesuai materi)
      - Diskusi sederhana dengan guru dan teman
      - Aktivitas hands-on atau berbasis proyek sederhana
      - Diferensiasi: untuk siswa yang membutuhkan bantuan tambahan dan siswa yang siap tantangan lebih
      - Penguatan 4C di setiap tahap

   c. Kegiatan Penutup (10-15 menit)
      - Refleksi bersama (apa yang dipelajari, apa yang disukai)
      - Menyimpulkan bersama dengan kata-kata anak sendiri
      - Penghargaan dan apresiasi terhadap usaha anak

7. Asesmen
   - Asesmen formatif yang dilakukan selama kegiatan
   - Instrumen asesmen yang sederhana dan autentik

8. Bahan dan Sumber Belajar
   - Bahan yang dibutuhkan (konkret dan mudah didapat)
   - Sumber belajar yang relevan

Fokus pada pembelajaran yang menyenangkan, aktif, dan bermakna bagi anak kelas 1.`,

    rpp: `Anda adalah ahli kurikulum SD yang berpengalaman menyusun RPP Kurikulum Merdeka.
Tugas: Buat RPP Plus Deep Learning untuk ${subjectName} Kelas 1 Semester 2.

${baseInfo}

FORMAT OUTPUT RPP:
I. INFORMASI UMUM
- Satuan Pendidikan
- Kelas/Semester
- Mata Pelajaran
- Topik/Tema
- Alokasi Waktu

II. CAPAIAN PEMBELAJARAN
- CP (sesuai input)
- TP (Tujuan Pembelajaran) yang diturunkan dari CP

III. TUJUAN PEMBELAJARAN
- Tujuan pembelajaran (3-5 tujuan, operasional dan terukur)
- Pencapaian Profil Pelajar Pancasila

IV. MATERI POKOK
- Materi pokok dan sub-materi
- Pemetaan materi untuk ${data.hours} jam pelajaran

V. MODEL DAN METODE PEMBELAJARAN
- Model: Project Based Learning (PjBL), Problem Based Learning (PBL), atau Discovery Learning
- Metode: Bermain, eksplorasi, diskusi, tanya jawab, demonstrasi, proyek sederhana
- Pendekatan: Saintifik, berbasis konteks, differentiated instruction

VI. MEDIA DAN SUMBER BELAJAR
- Media pembelajaran: konkret, visual, digital sederhana
- Bahan dan alat: yang mudah didapat di lingkungan sekolah/rumah
- Sumber belajar: buku pegangan, lingkungan, internet (jika ada)

VII. LANGKAH-LANGKAH KEGIATAN
Kegiatan Pendahuluan (10-15 menit):
- Salam dan doa
- Absensi
- Apersepsi dan motivasi
- Penyampaian tujuan (dalam bahasa anak)
- Bermain/ice breaking

Kegiatan Inti (${data.hours} x 30 menit):
Siklus bermain-eksplorasi-berdiskusi-refleksi diulang sesuai jumlah JP:
- Kegiatan bermain terstruktur sesuai materi
- Eksplorasi mandiri atau berkelompok
- Diskusi sederhana dengan bimbingan guru
- Penguatan konsep melalui refleksi terarah
- Diferensiasi konten, proses, atau produk

Kegiatan Penutup (10-15 menit):
- Refleksi bersama (apa yang dipelajari hari ini)
- Menyimpulkan (dibimbing guru, dengan kata-kata anak)
- Memberikan penguatan positif
- Informasi kegiatan berikutnya
- Doa penutup

VIII. ASESMEN
- Asesmen diagnostik (awal pembelajaran)
- Asesmen formatif (selama proses)
- Asesmen sumatif (akhir)
- Instrumen asesmen yang autentik dan menyenangkan untuk anak kelas 1

IX. DIFERENSIASI PEMBELAJARAN
- Untuk siswa yang membutuhkan bantuan: penjelasan lebih rinci, contoh lebih banyak, waktu lebih panjang
- Untuk siswa yang siap tantangan: tugas pengayaan, proyek tambahan, peran sebagai pembantu teman

Pastikan kegiatan sesuai dengan karakteristik anak kelas 1 dan menerapkan prinsip Deep Learning.`,

    lkpd: `Anda adalah ahli pembelajaran aktif dan asesmen autentik untuk SD kelas 1.
Tugas: Buat Lembar Kerja Peserta Didik (LKPD) berbasis aktivitas nyata untuk ${subjectName} Kelas 1 Semester 2.

${baseInfo}

FORMAT OUTPUT LKPD:
LKPD: ${data.topic}
Kelas 1 SD - ${subjectName}

PETUNJUK UMUM:
- Baca dan dengarkan penjelasan guru
- Kerjakan dengan senang hati dan teliti
- Tidak ada jawaban salah, yang penting berani mencoba
- Bekerjasama dengan teman jika diperbolehkan

BAGIAN 1: AKTIVITAS PENGAMATAN (Bermain dan Eksplorasi)
- Kegiatan mengamati sesuai materi (gambar, benda konkret, lingkungan sekitar)
- Pertanyaan panduan untuk anak mencatat apa yang dilihat, didengar, dirasakan
- Ruang untuk menggambar atau mewarnai hasil pengamatan

BAGIAN 2: AKTIVITAS MENCUBA (Hands-on)
- Langkah-langkah sederhana yang harus dilakukan anak
- Ruang untuk menuliskan hasil cobaan (bisa ditulis guru untuk anak)
- Pertanyaan refleksi: Apa yang terjadi? Bagaimana perasaanmu?

BAGIAN 3: AKTIVITAS BERDISKUSI (Collaboration)
- Kegiatan diskusi sederhana dengan teman sebangku/kelompok kecil
- Pertanyaan panduan diskusi
- Ruang untuk menuliskan hasil diskusi (bisa ditulis guru)

BAGIAN 4: AKTIVITAS BERPIKIR (Critical Thinking)
- Pertanyaan yang mendorong anak berpikir (bukan hanya mengingat)
- Soal terbuka dengan banyak kemungkinan jawaban
- Kegiatan kreatif: menghubungkan dengan kehidupan sehari-hari

BAGIAN 5: REFLEKSI DIRI
- Pertanyaan refleksi untuk anak:
  * Apa yang paling saya suka dari kegiatan hari ini?
  * Apa yang saya pelajari?
  * Apa yang ingin saya coba lagi?
- Ruang untuk menggambar perasaan

BONUS: AKTIVITATI TAMBAHAN (Untuk siswa yang siap tantangan)
- Tugas pengayaan sederhana
- Proyek mini yang dapat dilakukan di rumah

Catatan untuk Guru:
- Banyak gambar dan ilustrasi untuk memudahkan pemahaman
- Kalimat pendek dan sederhana
- Ruang cukup untuk menulis/menggambar
- Bisa diadaptasi sesuai kebutuhan kelas

Pastikan LKPD sesuai dengan kemampuan membaca dan menulis anak kelas 1.`,

    asesmen_diagnostik: `Anda adalah ahli asesmen pendidikan untuk SD kelas 1.
Tugas: Buat Asesmen Diagnostik untuk memetakan kemampuan awal siswa pada materi ${data.topic} - ${subjectName}.

${baseInfo}

FORMAT OUTPUT ASESMEN DIAGNOSTIK:

TUJUAN ASESMEN DIAGNOSTIK:
- Mengidentifikasi pengetahuan/prasyarat yang sudah dimiliki siswa
- Mengetahui miskonsepsi yang mungkin ada
- Menentukan titik awal pembelajaran yang tepat
- Mengidentifikasi kebutuhan diferensiasi

WAKTU PELAKSANAAN: 15-20 menit (dapat dilakukan sebelum atau di awal pembelajaran)

BAGIAN 1: ASESMEN OBSERVASI (Selama Kegiatan Bermain)
Panduan pengamatan guru:
- Perhatikan kemampuan siswa saat bermain dan eksplorasi
- Catat perilaku yang menunjukkan pengetahuan awal
- Indikator:
  1. [Indikator spesifik sesuai materi]
  2. [Indikator spesifik sesuai materi]
  3. [Indikator spesifik sesuai materi]

Format catatan:
Nama Siswa | Indikator 1 | Indikator 2 | Indikator 3 | Catatan
-----------|------------|------------|------------|----------

BAGIAN 2: ASESMEN LISAN (Tanya Jawab Sederhana)
Pertanyaan panduan untuk guru (sesuai materi ${data.topic}):
1. [Pertanyaan sederhana untuk mengetahui pengetahuan awal]
2. [Pertanyaan lanjutan untuk menggali pemahaman]
3. [Pertanyaan yang menguji kemampuan mengaplikasikan]

Pedoman penilaian:
- Jawaban lengkap dan tepat: ✓✓✓
- Jawaban sebagian tepat: ✓✓
- Jawaban kurang tepat: ✓
- Tidak menjawab/salah: -

BAGIAN 3: ASESMEN TERTULIS SEDERHANA (Jika sudah bisa menulis dasar)
Pilihan Ganda Gambar (untuk kelas 1):
- 5 pertanyaan dengan gambar ilustrasi
- Anak memilih gambar yang sesuai dengan pertanyaan

Menjodohkan:
- Gambar di sebelah kiri, pilihan di sebelah kanan
- Anak menghubungkan gambar dengan jawaban yang tepat

Isian Singkat:
- 3-5 pertanyaan isian singkat
- Ruang untuk menulis jawaban (bisa dibantu guru menuliskan)

BAGIAN 4: ASESMEN PERFORMANCE (Melakukan Sesuatu)
Tugas performa sederhana (sesuai materi):
- Anak diminta melakukan sesuatu (menunjuk, meniru, menyusun, dll)
- Panduan penilaian dengan checklist

KESIMPULAN DAN REKOMENDASI:
Berdasarkan hasil asesmen diagnostik:
- Siswa yang sudah siap (perlu pengayaan)
- Siswa yang membutuhkan bantuan (perlu remedi)
- Strategi pembelajaran yang disarankan

Catatan untuk Guru:
- Asesmen diagnostik tidak dinilai dengan nilai
- Fokus pada pemetaan kebutuhan belajar
- Hasil digunakan untuk menyesuaikan strategi pembelajaran
- Lakukan dengan suasana menyenangkan, tidak menekankan siswa`,

    asesmen_formatif: `Anda adalah ahli asesmen pembelajaran aktif untuk SD kelas 1.
Tugas: Buat Asesmen Formatif untuk memantau perkembangan pembelajaran pada materi ${data.topic} - ${subjectName}.

${baseInfo}

FORMAT OUTPUT ASESMEN FORMATIF:

TUJUAN ASESMEN FORMATIF:
- Memantau kemajuan belajar siswa selama proses pembelajaran
- Memberikan umpan balik langsung kepada siswa
- Mengidentifikasi siswa yang membutuhkan bantuan tambahan
- Menyesuaikan strategi pembelajaran jika diperlukan

JENIS ASESMEN FORMATIF:

1. ASESMEN SELAMA KEGIATAN (Observasi Terarah)
Panduan observasi guru:
- Perhatikan keterlibatan siswa saat bermain dan eksplorasi
- Catat partisipasi dalam diskusi
- Amati kemampuan kolaborasi dengan teman
- Perhatikan sikap dan motivasi belajar

Checklist Observasi:
Siswa: ____________ Tanggal: ____________

Indikator:
- [ ] Aktif berpartisipasi dalam kegiatan bermain
- [ ] Berani mengemukakan pendapat/jawaban
- [ ] Mau bekerja sama dengan teman
- [ ] Mengikuti instruksi dengan baik
- [ ] Menunjukkan rasa ingin tahu
- [ ] Mampu menyelesaikan tugas dengan bantuan
- [ ] Mampu menyelesaikan tugas mandiri

Catatan: _________________________________

2. ASESMEN TANYA JAWAB (Selama Proses)
Pertanyaan formatif untuk guru:
- Pertanyaan untuk mengecek pemahaman dasar
- Pertanyaan untuk menggali pemahaman mendalam
- Pertanyaan untuk menghubungkan dengan kehidupan nyata

Teknik memberikan umpan balik:
- Pujian spesifik (bukan "bagus" saja, tapi "bagus karena...")
- Koreksi dengan cara yang positif
- Dorongan untuk terus mencoba

3. ASESMEN TUGAS SEDERHANA (Selama Kegiatan)
Tugas selama kegiatan (sesuai materi ${data.topic}):
- [Jelaskan tugas yang harus dilakukan siswa selama kegiatan]
- [Indikator keberhasilan tugas]
- [Cara menilai]

Rubrik Sederhana:
- Melakukan dengan tepat dan mandiri: Bintang 3
- Melakukan dengan tepat dengan sedikit bantuan: Bintang 2
- Melakukan dengan banyak bantuan: Bintang 1
- Belum mampu melakukan: Bintang 0

4. ASESMEN PORTOFOLIO MINI
Karya yang dikumpulkan:
- Hasil gambar/mewarnai
- Hasil eksplorasi atau proyek sederhana
- Catatan atau tulisan sederhana (jika sudah bisa menulis)

Catatan guru tentang perkembangan:
- Minggu 1: _________________________________
- Minggu 2: _________________________________
- Minggu 3: _________________________________

5. ASESMEN SELF-REFLECTION (Untuk Siswa)
Buat stiker/smiley untuk siswa:
- Senyum = Sangat senang dengan kegiatan
- Tersenyum = Senang dengan kegiatan
- Netral = Biasa saja
- Sedih = Tidak senang dengan kegiatan

Pertanyaan refleksi (dibacakan guru, siswa jawab lisan):
1. Apa yang paling kamu sukai dari kegiatan hari ini?
2. Apa yang kamu pelajari hari ini?
3. Apa yang ingin kamu coba lagi besok?

REKOMENDASI TINDAK LANJUT:
Berdasarkan hasil asesmen formatif:
- Siswa yang perlu pengayaan:
- Siswa yang perlu remedi:
- Strategi pembelajaran yang perlu disesuaikan:

Catatan Penting:
- Asesmen formatif dilakukan secara berkelanjutan
- Fokus pada kemajuan dan perkembangan, bukan nilai akhir
- Umpan balik harus diberikan segera dan spesifik
- Gunakan bahasa positif dan membangun
- Jadikan asesmen sebagai bagian menyenangkan dari pembelajaran`,

    rubrik: `Anda adalah ahli penilaian pendidikan untuk SD kelas 1.
Tugas: Buat Rubrik Penilaian untuk sikap, pengetahuan, dan keterampilan pada materi ${data.topic} - ${subjectName}.

${baseInfo}

FORMAT OUTPUT RUBRIK PENILAIAN:

RUBRIK PENILAIAN SIKAP (Attitude)

Aspek yang Dinilai:
1. Disiplin dan Tanggung Jawab
   - Mengikuti instruksi
   - Menyelesaikan tugas tepat waktu
   - Memperhatikan penjelasan guru

2. Kerjasama dan Gotong Royong
   - Mau berbagi dengan teman
   - Membantu teman yang kesulitan
   - Bekerja sama dalam kelompok

3. Rasa Ingin Tahu dan Kreativitas
   - Mengajukan pertanyaan
   - Mencoba ide-ide baru
   - Menunjukkan antusiasme belajar

4. Keberanian dan Percaya Diri
   - Berani menjawab pertanyaan
   - Berani tampil di depan (jika diminta)
   - Tidak takut salah

Rubrik Sikap:
Skala 4 (Sangat Baik):
- Selalu menunjukkan sikap positif tanpa perlu diingatkan
- Menjadi teladan bagi teman-teman

Skala 3 (Baik):
- Sering menunjukkan sikap positif
- Kadang perlu diingatkan sedikit

Skala 2 (Cukup):
- Kadang menunjukkan sikap positif
- Sering perlu diingatkan

Skala 1 (Kurang):
- Jarang menunjukkan sikap positif
- Selalu perlu diingatkan

RUBRIK PENILAIAN PENGETAHUAN (Knowledge)

Indikator Pengetahuan untuk ${data.topic}:
1. Mengingat (Recall)
   - Menyebutkan fakta dasar
   - Mengenal istilah penting

2. Memahami (Understand)
   - Menjelaskan dengan kata-kata sendiri
   - Mencontohkan dari pengalaman

3. Mengaplikasikan (Apply)
   - Menggunakan pengetahuan dalam situasi baru
   - Menyelesaikan masalah sederhana

4. Menganalisis (Analyze) - untuk kelas 1 sederhana saja
   - Membedakan hal-hal yang berbeda
   - Mengelompokkan berdasarkan ciri tertentu

Rubrik Pengetahuan:
Skala 4 (Sangat Baik):
- Menguasai semua indikator dengan sangat baik
- Dapat menjelaskan dengan kata-kata sendiri
- Dapat mengaplikasikan dalam berbagai situasi

Skala 3 (Baik):
- Menguasai sebagian besar indikator
- Dapat menjelaskan dengan sedikit bantuan
- Dapat mengaplikasikan dalam situasi yang jelas

Skala 2 (Cukup):
- Menguasai beberapa indikator dasar
- Perlu bantuan untuk menjelaskan
- Kesulitan mengaplikasikan

Skala 1 (Kurang):
- Hanya menguasai sedikit indikator
- Perlu banyak bantuan
- Belum dapat mengaplikasikan

RUBRIK PENILAIAN KETERAMPILAN (Skills)

Keterampilan ${subjectName} yang Dinilai:
1. Keterampilan Motorik (sesuai mata pelajaran)
   - [Keterampilan spesifik sesuai mapel, misalnya: menulis, melukis, gerakan, dll]

2. Keterampilan Komunikasi
   - Menyampaikan ide dengan jelas
   - Menjawab pertanyaan dengan tepat

3. Keterampilan Kolaborasi
   - Bekerja sama dalam kelompok
   - Mengambil bagian dalam tugas kelompok

Rubrik Keterampilan:
Skala 4 (Sangat Baik):
- Melakukan keterampilan dengan sangat tepat dan mandiri
- Sangat rapi dan teliti
- Dapat mencontohkan kepada teman

Skala 3 (Baik):
- Melakukan keterampilan dengan tepat dengan sedikit bantuan
- Rapi dan cukup teliti
- Mampu menyelesaikan tugas

Skala 2 (Cukup):
- Melakukan keterampilan dengan banyak bantuan
- Kurang rapi atau kurang teliti
- Perlu panduan langkah demi langkah

Skala 1 (Kurang):
- Kesulitan melakukan keterampilan
- Perlu bantuan terus menerus
- Belum mandiri

PANDUAN PENGGUNAAN RUBRIK:
1. Gunakan rubrik untuk mengasesmen secara objektif
2. Berikan umpan balik spesifik kepada siswa
3. Gunakan hasil untuk merencanakan pembelajaran berikutnya
4. Dokumentasikan perkembangan siswa dari waktu ke waktu
5. Sesuaikan rubrik dengan karakteristik kelas

CATATAN KHUSUS:
- Untuk kelas 1, fokus pada proses dan usaha, bukan hanya hasil
- Berikan pujian untuk kemajuan, sekecil apapun
- Gunakan bahasa positif dan membangun
- Jelaskan rubrik kepada siswa dengan bahasa sederhana`,

    jurnal: `Anda adalah ahli refleksi pedagogik untuk guru SD.
Tugas: Buat Jurnal Refleksi Guru dan Jurnal Refleksi Peserta Didik untuk pembelajaran ${data.topic} - ${subjectName}.

${baseInfo}

FORMAT OUTPUT JURNAL:

JURNAL REFLEKSI GURU
Materi: ${data.topic}
Kelas: 1 SD - ${subjectName}
Tanggal: _____________
Nama Guru: _____________

A. PERSIAPAN PEMBELAJARAN
1. Apakah materi yang dipilih sesuai dengan karakteristik siswa kelas 1?
   Jawaban: _________________
   Alasan: _________________

2. Apakah bahan dan media yang disiapkan memadai dan menarik?
   Jawaban: _________________
   Alasan: _________________

3. Apakah tujuan pembelajaran realistis dan dapat dicapai dalam ${data.hours} JP?
   Jawaban: _________________
   Alasan: _________________

B. PELAKSANAAN PEMBELAJARAN
1. Apakah siswa antusias dan berpartisipasi aktif?
   Jawaban: _________________
   Bukti: _________________

2. Kegiatan mana yang paling disukai siswa? Mengapa?
   Jawaban: _________________
   Alasan: _________________

3. Kegiatan mana yang perlu diperbaiki? Mengapa?
   Jawaban: _________________
   Perbaikan: _________________

4. Apakah diferensiasi pembelajaran berhasil diterapkan?
   Jawaban: _________________
   Alasan: _________________

5. Apakah asesmen yang digunakan efektif?
   Jawaban: _________________
   Alasan: _________________

C. PENGUATAN PROFIL PELAJAR PANCASILA
1. Elemen Profil Pelajar Pancasila mana yang berkembang baik?
   Jawaban: _________________
   Bukti: _________________

2. Elemen Profil Pelajar Pancasila mana yang perlu diperkuat?
   Jawaban: _________________
   Strategi: _________________

D. REFLEKSI DIRI GURU
1. Apa yang saya lakukan dengan baik?
   Jawaban: _________________

2. Apa yang perlu saya tingkatkan?
   Jawaban: _________________

3. Apa yang akan saya ubah pada pertemuan berikutnya?
   Jawaban: _________________

E. RENCANA TINDAK LANJUT
1. Siswa yang perlu bantuan tambahan:
   - Nama: _________ Kebutuhan: _________
   - Nama: _________ Kebutuhan: _________

2. Siswa yang siap untuk pengayaan:
   - Nama: _________ Tantangan: _________
   - Nama: _________ Tantangan: _________

3. Strategi pembelajaran berikutnya:
   _________________________________
   _________________________________

---

JURNAL REFLEKSI PESERTA DIDIK
(Khusus untuk siswa kelas 1 yang sudah dapat menulis dasar, atau dibantu guru menuliskan)

Nama Siswa: _____________ Kelas: 1 SD
Materi: ${data.topic}
Tanggal: _____________

GAMBAR PERASAAN
(Catatan: Beri tanda pada smiley yang sesuai perasaanmu)
Sangat Senang 😊 😊 😊
Senang 😊 😊
Biasa saja 😊
Kurang Senang 😐
Sedih 😢

PERTANYAAN REFLEKSI (Dibacakan Guru, Jawaban Dibantu Guru Jika Perlu)
1. Apa yang paling kamu suka dari kegiatan hari ini?
   Jawaban saya: _________________________________
   (atau gambar: _________________________________)

2. Apa yang kamu pelajari hari ini?
   Jawaban saya: _________________________________
   (atau gambar: _________________________________)

3. Apa yang kamu buat atau lakukan hari ini?
   Jawaban saya: _________________________________
   (atau gambar: _________________________________)

4. Bersama siapa kamu belajar hari ini?
   Jawaban saya: _________________________________

5. Apa yang ingin kamu coba lagi besok?
   Jawaban saya: _________________________________

GAMBAR KEGIATANKU
(Di sini siswa dapat menggambar kegiatan yang paling mereka sukai)
┌────────────────────────────────────┐
│                                    │
│                                    │
│                                    │
│                                    │
│                                    │
└────────────────────────────────────┘

PUJIAN UNTUK DIRI SENDIRI
Guru membantu siswa mengucapkan:
"Aku hebat karena hari ini aku..." (siswa melanjutkan)

---

PANDUAN PENGGUNAAN JURNAL:
1. Jurnal refleksi guru diisi setelah setiap pertemuan
2. Jurnal refleksi siswa diisi di akhir pembelajaran
3. Gunakan jurnal untuk perbaikan pembelajaran berikutnya
4. Bagikan refleksi siswa kepada orang tua sebagai bentuk komunikasi
5. Gunakan untuk mendokumentasikan perkembangan siswa

CATATAN KHUSUS:
- Jurnal refleksi untuk guru bersifat internal untuk perbaikan
- Jurnal refleksi untuk siswa dapat dibagikan kepada orang tua
- Fokus pada hal-hal positif dan kemajuan, bukan hanya kekurangan
- Jangan jadikan jurnal sebagai alat penilaian, tapi sebagai alat refleksi dan perbaikan`
  }

  return typePrompts[type] || ''
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json()

    // Validate required fields
    if (!formData.schoolName || !formData.subject || !formData.topic || !formData.cp) {
      return NextResponse.json(
        { error: 'Mohon lengkapi semua field yang wajib diisi' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    // Define all materials to generate
    const materials = [
      'atp',
      'modul_ajar',
      'rpp',
      'lkpd',
      'asesmen_diagnostik',
      'asesmen_formatif',
      'rubrik',
      'jurnal'
    ]

    // Generate all materials
    const results: Record<string, string> = {}
    for (const material of materials) {
      const systemPrompt = generateSystemPrompt(material, formData)
      const userPrompt = `Buat ${material.replace('_', ' ').toUpperCase()} untuk ${formData.topic} pada mata pelajaran ${getSubjectName(formData.subject)} Kelas 1 SD Semester 2.`

      try {
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          thinking: { type: 'disabled' }
        })

        const response = completion.choices[0]?.message?.content
        if (response) {
          results[material] = response
        }
      } catch (error) {
        console.error(`Error generating ${material}:`, error)
        results[material] = `Terjadi kesalahan saat membuat ${material}. Silakan coba lagi.`
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in generate-teaching-materials API:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
