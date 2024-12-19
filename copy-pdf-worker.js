import { copyFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyPdfWorker() {
  try {
    const source = join(__dirname, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
    const destination = join(__dirname, 'public', 'pdf.worker.mjs');

    await copyFile(source, destination);
    console.log('PDF worker file copied successfully');
  } catch (error) {
    console.error('Error copying PDF worker file:', error);
    process.exit(1);
  }
}

copyPdfWorker();
