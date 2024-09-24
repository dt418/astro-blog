import { html } from 'satori-html';
import satori from 'satori';
import sharp from 'sharp';

// Cache the font in memory to avoid repeated network requests
let cachedFont: ArrayBuffer | null = null;

// Function to download and cache the Google Font
async function getGoogleFont() {
  if (cachedFont) {
    // Return the cached font if it's already fetched
    return cachedFont;
  }

  // Direct font URL (for example: Roboto 400 weight, Latin subset)
  const fontUrl =
    'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf';

  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) {
    throw new Error('Failed to download Google Font');
  }

  // Cache the font after downloading
  cachedFont = await fontRes.arrayBuffer();
  return cachedFont;
}

export async function GET() {
  const markup = html(`
  <div
    style="height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: rgb(45,26,84); font-size: 32px; font-weight: 600;"
  >
    <div
      style="font-size: 70px; margin-top: 38px; display: flex; flex-direction: column; color: white;"
    >
      <span
        >Hello from
        <span style="margin-left:15ch;color: rgb(255,93,1);"
          >Astro</span
        ></span
      >
    </div>
  </div>`);

  const fontFile = await getGoogleFont(); // Fetch (or use cached) Google Font

  // resulting svg is basically a long string
  const svg: string = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Roboto',
        data: fontFile,
        style: 'normal',
        weight: 400, // Set the specific weight for optimization
      },
    ],
  });

  const webp = sharp(Buffer.from(svg)).webp();
  const response = await webp.toBuffer();

  return new Response(response, {
    status: 200,
    headers: {
      'Content-Type': 'image/webp',
    },
  });
}
