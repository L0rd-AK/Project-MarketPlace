import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '26214400'); // 25MB default

// Use /tmp directory in serverless environments (Vercel)
// WARNING: Files in /tmp are ephemeral and will be deleted when the function stops
// For production, consider using cloud storage (AWS S3, Cloudinary, etc.)
const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads' 
  : (process.env.UPLOAD_DIR || './uploads');

// Ensure upload directory exists
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create upload directory:', error);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate secure unique filename
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname);
    cb(null, `submission-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Only accept ZIP files
  if (ext !== '.zip') {
    cb(new Error('Only ZIP files are allowed'));
    return;
  }

  // Check mimetype (though this can be spoofed, we validate server-side too)
  const allowedMimeTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error('Invalid file type'));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
