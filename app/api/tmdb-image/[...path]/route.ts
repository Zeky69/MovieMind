import { NextRequest, NextResponse } from 'next/server';

/**
 * Route pour proxy des images TMDB si nécessaire
 * Utile pour éviter les problèmes CORS ou pour ajouter des headers personnalisés
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const imagePath = params.path.join('/');
  
  if (!imagePath) {
    return new NextResponse('Image path required', { status: 400 });
  }

  try {
    // Construire l'URL TMDB
    const tmdbImageUrl = `https://image.tmdb.org/t/p/original/${imagePath}`;
    
    // Faire la requête vers TMDB
    const response = await fetch(tmdbImageUrl);
    
    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Récupérer l'image
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Retourner l'image avec les bons headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache pendant 1 an
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    });
  } catch (error) {
    console.error('Error proxying TMDB image:', error);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
