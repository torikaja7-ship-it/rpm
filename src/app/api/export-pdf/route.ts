import puppeteer from 'puppeteer-core'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { documents, meta } = await req.json()

  const html = `
  <html>
  <head>
    <style>
      body { font-family: Arial; line-height: 1.6; }
      h1 { text-align: center; }
      h2 { page-break-before: always; }
    </style>
  </head>
  <body>
    <h1>📘 Perangkat Ajar Deep Learning</h1>
    <p>${meta.sekolah}</p>

    ${Object.entries(documents).map(
      ([key, content]) => `
        <h2>${key.toUpperCase()}</h2>
        <pre>${content}</pre>
      `
    ).join('')}
  </body>
  </html>
  `

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })

  const pdf = await page.pdf({ format: 'A4' })
  await browser.close()

  return new NextResponse(Buffer.from(pdf), {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="perangkat-ajar.pdf"'
  }
})
}
