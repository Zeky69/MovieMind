import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get('text') || 'Film';
  const width = parseInt(searchParams.get('width') || '500');
  const height = parseInt(searchParams.get('height') || '750');

  // Créer un SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="50%" y="40%" text-anchor="middle" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
        ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}
      </text>
      <text x="50%" y="55%" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="14">
        Poster non disponible
      </text>
      <circle cx="50%" cy="70%" r="30" fill="none" stroke="#64748b" stroke-width="2"/>
      <path d="M ${width/2 - 15} ${height * 0.7 - 10} L ${width/2} ${height * 0.7 + 5} L ${width/2 + 15} ${height * 0.7 - 10}" fill="none" stroke="#64748b" stroke-width="2"/>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600', // Cache pendant 1 heure
    },
  });
}
