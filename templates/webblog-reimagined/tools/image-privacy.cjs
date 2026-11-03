// Remove private metadata from the four reviewed, upright baseline JPEGs.
// Compressed pixels, colour profiles and all layout dimensions are preserved.
const PRIVATE_PHOTOS = new Set(['chair', 'corridor', 'temple', 'street'].map(name => `assets/projects/ml-sharp/${name}.jpg`));

function checkOrientation(payload) {
  if (!payload.subarray(0, 6).equals(Buffer.from('Exif\0\0'))) return;
  const tiff = payload.subarray(6);
  const little = tiff.toString('ascii', 0, 2) === 'II';
  const u16 = pos => little ? tiff.readUInt16LE(pos) : tiff.readUInt16BE(pos);
  const u32 = pos => little ? tiff.readUInt32LE(pos) : tiff.readUInt32BE(pos);
  if (u16(2) !== 42) throw new Error('Invalid TIFF metadata');
  const directory = u32(4);
  for (let i = 0; i < u16(directory); i++) {
    const pos = directory + 2 + i * 12;
    if (u16(pos) === 0x112 && (u16(pos + 2) !== 3 || u32(pos + 4) !== 1 || u16(pos + 8) !== 1)) {
      throw new Error('Photo needs orientation normalization before metadata removal');
    }
  }
}

function sanitizeProjectAsset(rel, bytes) {
  if (!PRIVATE_PHOTOS.has(rel)) return bytes;
  if (bytes.readUInt16BE(0) !== 0xffd8) throw new Error('Expected JPEG: ' + rel);
  const parts = [bytes.subarray(0, 2)];
  let pos = 2, baseline = false;
  while (pos < bytes.length) {
    const start = pos;
    if (bytes[pos++] !== 0xff) throw new Error('Invalid JPEG marker: ' + rel);
    while (bytes[pos] === 0xff) pos++;
    const marker = bytes[pos++];
    if (pos + 2 > bytes.length) throw new Error('Truncated JPEG: ' + rel);
    const size = bytes.readUInt16BE(pos);
    if (size < 2 || pos + size > bytes.length) throw new Error('Invalid JPEG segment: ' + rel);
    if (marker === 0xc0) baseline = true;
    if (marker === 0xda) {
      if (!baseline) throw new Error('Only reviewed baseline JPEGs are supported: ' + rel);
      parts.push(bytes.subarray(start));
      return Buffer.concat(parts);
    }
    if (marker === 0xe1) checkOrientation(bytes.subarray(pos + 2, pos + size));
    // APP1: EXIF/XMP (including embedded thumbnails); APP13: IPTC; COM: comments.
    if (![0xe1, 0xed, 0xfe].includes(marker)) parts.push(bytes.subarray(start, pos + size));
    pos += size;
  }
  throw new Error('Missing JPEG scan: ' + rel);
}

module.exports = {PRIVATE_PHOTOS, sanitizeProjectAsset};
