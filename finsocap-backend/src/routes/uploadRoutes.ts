import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// =======================================================
// MULTER UPLOAD STORAGE CONFIGURATION
// Saves uploaded Aadhaar, PAN, Shop Photos, and PDF docs
// =======================================================

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sanitized}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit per file
});

const router = Router();

/**
 * Upload a single file (Aadhaar / PAN / Shop Photo / PDF)
 * POST /api/upload/single
 */
router.post('/single', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    file: {
      fileName: req.file.originalname,
      storedName: req.file.filename,
      fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

/**
 * Upload multiple files (e.g. KYC bundle)
 * POST /api/upload/multiple
 */
router.post('/multiple', upload.array('files', 5), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const uploadedList = files.map((f) => ({
    fileName: f.originalname,
    storedName: f.filename,
    fileUrl: `/uploads/${f.filename}`,
    size: f.size,
    mimetype: f.mimetype,
  }));

  return res.status(201).json({
    success: true,
    message: `${uploadedList.length} files uploaded successfully`,
    files: uploadedList,
  });
});

export default router;
