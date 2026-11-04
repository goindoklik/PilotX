const TEMPLATE_URL = new URL('../templates/undanganjadi.jpeg', import.meta.url).href;

function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, fontSize: number, minSize = 18) {
  let size = fontSize;
  do {
    ctx.font = `700 ${size}px Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth || size <= minSize) break;
    size -= 1;
  } while (size > minSize);
  ctx.fillText(text, x, y);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateInvitationBase64(eventDate: string, eventTime: string, venue: string): Promise<string> {
  const image = new Image();
  image.src = TEMPLATE_URL;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tidak dapat menyiapkan gambar undangan.');
  ctx.drawImage(image, 0, 0);

  const [year, month, day] = eventDate.split('-').map(Number);
  const dateLabel = new Date(year, month - 1, day).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).replace(/^./, c => c.toLocaleUpperCase('id-ID'));
  const timeLabel = eventTime.slice(0, 5) + ' WIB';
  let venueName = venue.trim();
  let venueAddress = '';
  if (venueName.includes('\n')) {
    const parts = venueName.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    venueName = parts.shift() ?? '';
    venueAddress = parts.join(' ');
  } else {
    const addressStart = venueName.indexOf('(');
    if (addressStart > 0) {
      venueAddress = venueName.slice(addressStart).trim();
      venueName = venueName.slice(0, addressStart).trim();
    }
  }

  ctx.fillStyle = '#fffdf8';
  ctx.fillRect(706, 620, 414, 51);
  ctx.fillRect(706, 746, 310, 58);
  ctx.fillRect(706, 822, 414, 46);
  ctx.fillRect(706, 868, 414, 70);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#c51d24';
  fitText(ctx, dateLabel, 720, 660, 390, 30, 20);
  fitText(ctx, timeLabel, 720, 793, 285, 43, 28);
  fitText(ctx, venueName, 720, 862, 390, 48, 24);
  if (venueAddress) {
    ctx.fillStyle = '#111111';
    ctx.font = '700 30px Arial, sans-serif';
    wrapLines(ctx, venueAddress, 390).slice(0, 2).forEach((line, index) => {
      fitText(ctx, line, 720, 899 + index * 34, 390, 30, 22);
    });
  }
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(value => value ? resolve(value) : reject(new Error('Gagal membuat file gambar undangan.')), 'image/jpeg', 0.94);
  });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}