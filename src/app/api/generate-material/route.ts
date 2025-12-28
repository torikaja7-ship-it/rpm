import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

/* ================================
   TYPE DEFINITIONS
================================ */
type GenerateType =
  | 'atp'
  | 'modul_ajar'
  | 'rpp'
  | 'lkpd'
  | 'asesmen'
  | 'rubrik'
  | 'jurnal'

type FormData = {
  sekolah: string
  mapel: string
  topik: string
  cp: string
}

/* ================================
   PROMPT BUILDER
================================ */
function buildPrompt(type: GenerateType, formData: FormData): string {
  const baseContext = `
Anda adalah AHLI KURIKULUM MERDEKA dan FASILITATOR PEMBELAJARAN MENDALAM SD.

KONTEKS PEMBELAJARAN:
- Jenjang              : SD
- Kelas                : 1
- Semester             : 2
- Kurikulum            : Kurikulum Merdeka
- Pendekatan           : Deep Learning
- Satuan Pendidikan    : ${formData.sekolah}
- Mata Pelajaran       : ${formData.mapel}
- Topik                : ${formData.topik}

CAPAIAN PEMBELAJARAN (CP):
${formData.cp}

PRINSIP WAJIB:
- Berpusat pada peserta didik
- Bermakna, kontekstual, dan menyenangkan
- Sesuai karakteristik anak kelas 1 SD
- Menguatkan Profil Pelajar Pancasila
- Bahasa sederhana, operasional, dan ramah anak

BATASAN OUTPUT:
- Maksimal ±600 kata
- Gunakan poin-poin
- Langsung siap digunakan guru
`

  switch (type) {
    case 'atp':
      return `${baseContext}
TUGAS:
Susun ALUR TUJUAN PEMBELAJARAN (ATP).

FORMAT:
1. Tujuan Pembelajaran per tahap
2. Urutan logis dan bertahap
3. Keterkaitan dengan CP
`

    case 'modul_ajar':
      return `${baseContext}
TUGAS:
Susun MODUL AJAR berbasis Deep Learning.

KOMPONEN:
1. Identitas Modul
2. Tujuan Pembelajaran
3. Pemahaman Bermakna
4. Pertanyaan Pemantik
5. Langkah Pembelajaran (Awal–Inti–Penutup)
6. Diferensiasi Pembelajaran
7. Asesmen
`

    case 'rpp':
      return `${baseContext}
TUGAS:
Susun RPP Deep Learning.

KOMPONEN:
1. Tujuan Pembelajaran
2. Kegiatan Pembelajaran (Awal–Inti–Penutup)
3. Metode dan Media
4. Asesmen Autentik
5. Refleksi Guru
`

    case 'lkpd':
      return `${baseContext}
TUGAS:
Buat LKPD ramah anak kelas 1 SD.

KOMPONEN:
1. Tujuan Kegiatan
2. Petunjuk Sederhana
3. Aktivitas Konkret dan Bermain
4. Refleksi Sederhana Peserta Didik
`

    case 'asesmen':
      return `${baseContext}
TUGAS:
Susun ASESMEN Pembelajaran.

CAKUPAN:
1. Asesmen Diagnostik
2. Asesmen Formatif
3. Asesmen Sumatif
`

    case 'rubrik':
      return `${baseContext}
TUGAS:
Buat RUBRIK PENILAIAN.

ASPEK:
1. Sikap
2. Pengetahuan
3. Keterampilan
Gunakan kriteria sederhana dan mudah dipahami.
`

    case 'jurnal':
      return `${baseContext}
TUGAS:
Buat JURNAL REFLEKSI PEMBELAJARAN.

ISI:
1. Jurnal Refleksi Guru
2. Refleksi Peserta Didik (bahasa anak)
`

    default:
      return `${baseContext}
TUGAS:
Susun perangkat pembelajaran sesuai konteks di atas.
`
  }
}

/* ================================
   API HANDLER
================================ */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      type: GenerateType
      formData: FormData
    }

    if (!body?.type || !body?.formData) {
      return NextResponse.json(
        { success: false, error: 'Type atau formData tidak lengkap' },
        { status: 400 }
      )
    }

    // ⚠️ Z-AI membaca config dari .z-ai-config
    const zai = await ZAI.create()

    const prompt = buildPrompt(body.type, body.formData)

    const completion = await zai.chat.completions.create({
      model: 'glm-4.5',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content =
      completion?.choices?.[0]?.message?.content ?? ''

    return NextResponse.json({
      success: true,
      type: body.type,
      content
    })
  } catch (error) {
    console.error('ERROR GENERATE MATERIAL:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Gagal membuat perangkat ajar'
      },
      { status: 500 }
    )
  }
}
