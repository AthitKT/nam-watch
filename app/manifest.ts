import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'น้ำวอทช์ (Nam-Watch)',
    short_name: 'Nam-Watch',
    description: 'ติดตามระดับน้ำ กรุงเทพมหานคร และ ปทุมธานี',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#2F80ED',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      },
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml'
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml'
      }
    ]
  };
}
