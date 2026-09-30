import { NextRequest, NextResponse } from 'next/server';
import http from 'http';
import https from 'https';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Bangkok weather/drainage servers only serve over HTTP (port 80)
  if (targetUrl.includes('bangkok.go.th') && targetUrl.startsWith('https://')) {
    targetUrl = targetUrl.replace('https://', 'http://');
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const req = client.get(
        targetUrl!,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
          rejectUnauthorized: false,
          timeout: 10000,
        } as https.RequestOptions,
        (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Upstream returned status ${res.statusCode}`));
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }
      );

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Connection timed out'));
      });
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[CCTV Proxy Failure]:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch camera snapshot' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
