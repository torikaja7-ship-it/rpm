'use client'

import { useState } from 'react'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type DocType =
  | 'atp'
  | 'modul_ajar'
  | 'rpp'
  | 'lkpd'
  | 'asesmen'
  | 'rubrik'
  | 'jurnal'

const DOCUMENTS: { key: DocType; label: string }[] = [
  { key: 'atp', label: 'ATP' },
  { key: 'modul_ajar', label: 'Modul Ajar' },
  { key: 'rpp', label: 'RPP' },
  { key: 'lkpd', label: 'LKPD' },
  { key: 'asesmen', label: 'Asesmen' },
  { key: 'rubrik', label: 'Rubrik' },
  { key: 'jurnal', label: 'Jurnal' }
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function Page() {
  const [formData, setFormData] = useState({
    sekolah: '',
    mapel: '',
    topik: '',
    cp: ''
  })

  const [status, setStatus] = useState<Record<DocType, Status>>({
    atp: 'idle',
    modul_ajar: 'idle',
    rpp: 'idle',
    lkpd: 'idle',
    asesmen: 'idle',
    rubrik: 'idle',
    jurnal: 'idle'
  })

  const [results, setResults] = useState<Record<DocType, string>>({} as any)
  const [open, setOpen] = useState<Record<DocType, boolean>>({} as any)
  const [isRunning, setIsRunning] = useState(false)

  const generateAll = async () => {
    setIsRunning(true)

    for (const doc of DOCUMENTS) {
      setStatus((s) => ({ ...s, [doc.key]: 'loading' }))

      try {
        const res = await fetch('/api/generate-material', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: doc.key,
            formData
          })
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error('Generate gagal')
        }

        setResults((r) => ({ ...r, [doc.key]: data.content }))
        setStatus((s) => ({ ...s, [doc.key]: 'success' }))
        setOpen((o) => ({ ...o, [doc.key]: true }))
      } catch (e) {
        console.error(e)
        setStatus((s) => ({ ...s, [doc.key]: 'error' }))
      }
    }

    setIsRunning(false)
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Teks berhasil disalin')
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* FORM */}
      <Card>
        <CardHeader>
          <CardTitle>Generator Perangkat Ajar Deep Learning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Nama Sekolah"
            value={formData.sekolah}
            onChange={(e) =>
              setFormData({ ...formData, sekolah: e.target.value })
            }
          />
          <Input
            placeholder="Mata Pelajaran"
            value={formData.mapel}
            onChange={(e) =>
              setFormData({ ...formData, mapel: e.target.value })
            }
          />
          <Input
            placeholder="Topik"
            value={formData.topik}
            onChange={(e) =>
              setFormData({ ...formData, topik: e.target.value })
            }
          />
          <Textarea
            placeholder="Capaian Pembelajaran (CP)"
            rows={4}
            value={formData.cp}
            onChange={(e) =>
              setFormData({ ...formData, cp: e.target.value })
            }
          />

          <Button
            onClick={generateAll}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning
              ? 'Sedang Membuat Perangkat Ajar...'
              : 'Generate Perangkat Ajar'}
          </Button>
        </CardContent>
      </Card>

      {/* HASIL */}
      <Card>
        <CardHeader>
          <CardTitle>Hasil Perangkat Ajar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DOCUMENTS.map((doc) => (
            <div key={doc.key} className="border rounded-lg">
              <div className="flex items-center justify-between p-3">
                <div className="font-medium">{doc.label}</div>

                {status[doc.key] === 'loading' && (
                  <Loader2 className="animate-spin text-blue-500" />
                )}

                {status[doc.key] === 'success' && (
                  <CheckCircle2 className="text-green-600" />
                )}

                {status[doc.key] === 'error' && (
                  <XCircle className="text-red-600" />
                )}
              </div>

              {status[doc.key] === 'success' && (
                <>
                  <button
                    onClick={() =>
                      setOpen((o) => ({
                        ...o,
                        [doc.key]: !o[doc.key]
                      }))
                    }
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm border-t"
                  >
                    {open[doc.key] ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Sembunyikan
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> Lihat hasil
                      </>
                    )}
                  </button>

                  {open[doc.key] && (
                    <div className="p-4 border-t bg-muted/50">
                      <div className="flex justify-end mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyText(results[doc.key] || '')
                          }
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>

                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {results[doc.key]}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
