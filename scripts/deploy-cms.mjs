import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const cmsDistDir = path.join(rootDir, 'cms', 'dist');
const targetDir = path.join(rootDir, 'public', 'panel');

async function deployCms() {
  console.log('Copying CMS dist to public/panel...');
  
  try {
    // Verify source directory exists
    if (!fs.existsSync(cmsDistDir)) {
      console.error(`Error: Source directory "${cmsDistDir}" not found. Did you run the CMS build?`);
      process.exit(1);
    }

    // Ensure the target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created directory: ${targetDir}`);
    }

    // Copy files
    // cpSync is available in Node 16.7.0+
    fs.cpSync(cmsDistDir, targetDir, { recursive: true });
    
    console.log('CMS deployment completed successfully!');
  } catch (error) {
    console.error('Error during CMS deployment:', error);
    process.exit(1);
  }
}

deployCms();
