
import { NextResponse } from 'next/server';

const DOCUMENT_ID = '1w9lG2ER7IGdkT_MbtrDQ8hsH6_KFFUKKPeYKxm-9Roo';

const PDF_EXPORT_URL =
  `https://docs.google.com/document/d/${DOCUMENT_ID}/export?format=pdf`;

export async function GET() {
  try {
    const upstream = await fetch(PDF_EXPORT_URL, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!upstream.ok) {
      console.error('Google Docs export failed:', upstream.status);

      return NextResponse.json(
        { error: 'Unable to download resume' },
        { status: 502 }
      );
    }

    const contentType =
      upstream.headers.get('content-type') || '';

    const pdfBuffer = await upstream.arrayBuffer();

    // Check that Google returned a real PDF
    const signature = new TextDecoder().decode(
      pdfBuffer.slice(0, 5)
    );

    if (
      !contentType.includes('application/pdf') ||
      signature !== '%PDF-'
    ) {
      console.error('Invalid PDF response:', contentType);

      return NextResponse.json(
        { error: 'Google Docs did not return a PDF' },
        { status: 502 }
      );
    }

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="Aishwarya_Tupe_Resume.pdf"',
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Resume download error:', error);

    return NextResponse.json(
      { error: 'Failed to download resume' },
      { status: 500 }
    );
  }
}
