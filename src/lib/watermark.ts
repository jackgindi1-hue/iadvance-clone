// Watermark utility for adding "HIGHLINE FUNDING" watermark to uploaded files
// Supports both images (jpg, png, etc.) and PDFs
// BUILD VERSION: 2026-01-13-v3 - Force fresh deployment

// Check if file is an image
function isImage(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.gif', '.bmp'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

// Check if file is a PDF
function isPDF(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf');
}

// Add watermark to an image using sharp
async function addWatermarkToImage(buffer: Buffer, filename: string): Promise<{ buffer: Buffer; success: boolean }> {
  console.log(`🖼️ [IMG-WM-v3] Starting image watermark for: ${filename}`);
  try {
    // Dynamic import of sharp
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default;
    console.log(`🖼️ [IMG-WM-v3] Sharp imported successfully`);

    const image = sharp(buffer);
    const metadata = await image.metadata();
    console.log(`🖼️ [IMG-WM-v3] Image metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // Create a diagonal watermark SVG with MORE VISIBLE watermark
    const fontSize = Math.max(Math.min(width, height) / 12, 30);
    const watermarkText = 'HIGHLINE FUNDING';

    // Create SVG with repeated watermark pattern - MORE OPAQUE
    const svgWatermark = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="watermarkPattern" width="${fontSize * 14}" height="${fontSize * 5}" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <text x="10" y="${fontSize * 1.2}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" fill="rgba(255, 140, 66, 0.35)" font-weight="bold">
              ${watermarkText}
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#watermarkPattern)" />
      </svg>
    `;

    const watermarkedBuffer = await image
      .composite([
        {
          input: Buffer.from(svgWatermark),
          gravity: 'center',
        },
      ])
      .toBuffer();

    console.log(`✅ [IMG-WM-v3] Watermark SUCCESSFULLY added to image: ${filename} (${watermarkedBuffer.length} bytes)`);
    return { buffer: watermarkedBuffer, success: true };
  } catch (error: any) {
    console.error(`❌ [IMG-WM-v3] FAILED to add watermark to image ${filename}`);
    console.error(`❌ [IMG-WM-v3] Error type: ${error?.constructor?.name}`);
    console.error(`❌ [IMG-WM-v3] Error message: ${error?.message}`);
    // Return original buffer - watermarking failed
    return { buffer, success: false };
  }
}

// Add watermark to a PDF using pdf-lib
async function addWatermarkToPDF(buffer: Buffer, filename: string): Promise<{ buffer: Buffer; success: boolean }> {
  console.log(`📄 [PDF-WM-v3] Starting PDF watermark for: ${filename}`);
  console.log(`📄 [PDF-WM-v3] PDF size: ${buffer.length} bytes`);
  try {
    // Dynamic import of pdf-lib
    const { PDFDocument, rgb, degrees, StandardFonts } = await import('pdf-lib');
    console.log(`📄 [PDF-WM-v3] pdf-lib imported successfully`);

    // Try to load with ignoreEncryption - this handles owner-password-protected PDFs
    // but will still fail on user-password-protected PDFs
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(buffer, {
        ignoreEncryption: true,
        updateMetadata: false // Don't update metadata to avoid issues
      });
      console.log(`📄 [PDF-WM-v3] PDF loaded successfully`);
    } catch (loadError: any) {
      // If loading fails, the PDF is likely user-password protected or corrupted
      console.log(`⚠️ [PDF-WM-v3] PDF cannot be modified: ${loadError?.message}`);
      if (loadError?.message?.includes('encrypt')) {
        console.log(`🔒 [PDF-WM-v3] PDF is ENCRYPTED - bank statements often have encryption`);
        console.log(`🔒 [PDF-WM-v3] Returning original PDF without watermark`);
      } else {
        console.log(`⚠️ [PDF-WM-v3] Unknown PDF loading error - returning original`);
      }
      return { buffer, success: false }; // Return original, can't watermark
    }

    const pages = pdfDoc.getPages();
    console.log(`📄 [PDF-WM-v3] PDF has ${pages.length} pages`);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const watermarkText = 'HIGHLINE FUNDING';

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      const { width, height } = page.getSize();
      const fontSize = Math.max(Math.min(width, height) / 18, 24);
      console.log(`📄 [PDF-WM-v3] Processing page ${pageIndex + 1}: ${width}x${height}, fontSize: ${fontSize}`);

      // Draw multiple watermarks diagonally across the page
      const textWidth = helveticaBold.widthOfTextAtSize(watermarkText, fontSize);
      const spacing = textWidth * 1.8;

      let watermarkCount = 0;
      for (let y = -height; y < height * 2; y += spacing * 0.5) {
        for (let x = -width; x < width * 2; x += spacing) {
          page.drawText(watermarkText, {
            x: x,
            y: y,
            size: fontSize,
            font: helveticaBold,
            color: rgb(1, 0.55, 0.26), // Orange color #FF8C42
            opacity: 0.20, // More visible
            rotate: degrees(-35),
          });
          watermarkCount++;
        }
      }
      console.log(`📄 [PDF-WM-v3] Added ${watermarkCount} watermarks to page ${pageIndex + 1}`);
    }

    const watermarkedPdfBytes = await pdfDoc.save();
    console.log(`✅ [PDF-WM-v3] SUCCESSFULLY watermarked PDF: ${filename} (${watermarkedPdfBytes.length} bytes)`);
    return { buffer: Buffer.from(watermarkedPdfBytes), success: true };
  } catch (error: any) {
    // This catches errors during watermark drawing or saving
    console.error(`❌ [PDF-WM-v3] FAILED to watermark PDF ${filename}`);
    console.error(`❌ [PDF-WM-v3] Error type: ${error?.constructor?.name}`);
    console.error(`❌ [PDF-WM-v3] Error message: ${error?.message}`);

    // Check if it's an encryption error
    if (error?.message?.includes('encrypt')) {
      console.log(`🔒 [PDF-WM-v3] PDF is encrypted - banks often protect statements`);
    }

    // Return original buffer - can't watermark this PDF
    console.log(`📄 [PDF-WM-v3] Returning original PDF without watermark`);
    return { buffer, success: false };
  }
}

// Main function to process files with watermark
export async function processFileWithWatermark(
  file: File
): Promise<{ buffer: Buffer; filename: string; watermarked: boolean }> {
  console.log(`🔍 [WM-v3] ========================================`);
  console.log(`🔍 [WM-v3] Processing file for watermark: ${file.name}`);
  console.log(`🔍 [WM-v3] File size: ${file.size} bytes`);
  console.log(`🔍 [WM-v3] File type: ${file.type}`);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = file.name;

  console.log(`🔍 [WM-v3] Buffer created: ${buffer.length} bytes`);

  if (isImage(filename)) {
    console.log(`📷 [WM-v3] Detected IMAGE file: ${filename}`);
    const { buffer: watermarkedBuffer, success } = await addWatermarkToImage(buffer, filename);
    const newFilename = success ? `WM_${filename}` : filename;
    console.log(`📷 [WM-v3] Image result: ${success ? '✅ WATERMARKED' : '❌ NOT WATERMARKED'}`);
    return { buffer: watermarkedBuffer, filename: newFilename, watermarked: success };
  } else if (isPDF(filename)) {
    console.log(`📄 [WM-v3] Detected PDF file: ${filename}`);
    const { buffer: watermarkedBuffer, success } = await addWatermarkToPDF(buffer, filename);
    const newFilename = success ? `WM_${filename}` : filename;
    console.log(`📄 [WM-v3] PDF result: ${success ? '✅ WATERMARKED' : '❌ NOT WATERMARKED (likely encrypted)'}`);
    return { buffer: watermarkedBuffer, filename: newFilename, watermarked: success };
  } else {
    console.log(`📁 [WM-v3] Unknown file type (${filename}), returning original without watermark`);
    return { buffer, filename, watermarked: false };
  }
}