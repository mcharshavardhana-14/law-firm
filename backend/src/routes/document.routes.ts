import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.middleware';
import * as documentController from '../controllers/document.controller';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 157286400, // 150MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|docx?|doc|jpg|jpeg|png|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, DOC, JPG, PNG, and TXT files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// Get all documents for a project
router.get('/project/:projectId', documentController.getDocumentsByProject);

// Get document by ID
router.get('/:id', documentController.getDocumentById);

// Upload document
router.post(
  '/upload',
  upload.single('document'),
  documentController.uploadDocument
);

// Upload multiple documents
router.post(
  '/upload-batch',
  upload.array('documents', 10),
  documentController.uploadBatchDocuments
);

// Delete document
router.delete('/:id', documentController.deleteDocument);

// Download document
router.get('/:id/download', documentController.downloadDocument);

export default router;
