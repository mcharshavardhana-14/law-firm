import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as analysisController from '../controllers/analysis.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Trigger document analysis
router.post('/:documentId/analyze', analysisController.analyzeDocument);

// Get analysis for a document
router.get('/:documentId', analysisController.getAnalysis);

// Get analysis status
router.get('/:documentId/status', analysisController.getAnalysisStatus);

// Update analysis (manual corrections)
router.put('/:documentId', analysisController.updateAnalysis);

// Export analysis
router.get('/:documentId/export', analysisController.exportAnalysis);

export default router;
