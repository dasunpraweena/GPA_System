import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createSamplePdf = () => {
  const dir = path.resolve(__dirname, '../../sample_data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, 'SE3104.pdf');

  // Create a clean, text-based PDF document containing the examination result data for SE3104
  const pdfLines = [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '5 0 obj << /Length 6 0 R >> stream'
  ];

  const contentStream = [
    'BT',
    '/F1 14 Tf',
    '50 740 Td (SABARAGAMUWA UNIVERSITY OF SRI LANKA) Tj',
    '/F1 11 Tf',
    '0 -20 Td (Faculty of Computing - Department of Software Engineering) Tj',
    '/F1 12 Tf',
    '0 -25 Td (SE3104 - Requirements Validation - Semester III) Tj',
    '/F1 10 Tf',
    '0 -18 Td (Examination: Jan / Feb 2026 - 2022/2023 batch) Tj',
    '0 -15 Td (Results are provisional, subject to Senate confirmation) Tj',
    '0 -30 Td (Main group) Tj',
    '0 -18 Td (22CSE0373   B) Tj',
    '0 -16 Td (22CSE0374   B+) Tj',
    '0 -16 Td (22CSE0375   C+) Tj',
    '0 -16 Td (22CSE0376   A-) Tj',
    '0 -16 Td (22CSE0377   A+) Tj',
    '0 -25 Td (1st attempt) Tj',
    '0 -18 Td (21CSE0174   AB) Tj',
    '0 -25 Td (2nd attempt) Tj',
    '0 -18 Td (20APSE4852   AB) Tj',
    'ET'
  ].join('\n');

  const streamLength = Buffer.byteLength(contentStream, 'utf8');

  const body = [
    ...pdfLines,
    contentStream,
    'endstream',
    'endobj',
    `6 0 obj ${streamLength} endobj`,
    'xref',
    '0 7',
    '0000000000 65535 f ',
    '0000000009 00000 n ',
    '0000000058 00000 n ',
    '0000000115 00000 n ',
    '0000000234 00000 n ',
    '0000000305 00000 n ',
    `0000000${(335 + streamLength).toString().padStart(3, '0')} 00000 n `,
    'trailer << /Size 7 /Root 1 0 R >>',
    'startxref',
    '450',
    '%%EOF'
  ].join('\n');

  fs.writeFileSync(filePath, body);
  console.log('[Sample PDF] Generated valid SE3104.pdf at:', filePath);
  return filePath;
};

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createSamplePdf();
}
