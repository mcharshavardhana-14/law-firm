import { Response } from 'express';
import { DocumentAnalysis, Document } from '../models/postgres';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';
import { analyzeDocumentWithAI } from '../services/ai.service';

// Analyze document
export const analyzeDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;

    // Find document
    const document = await Document.findByPk(documentId);
    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found',
      });
      return;
    }

    // Check if analysis already exists
    let analysis = await DocumentAnalysis.findOne({ where: { documentId } });

    if (analysis && analysis.analysisStatus === 'completed') {
      res.status(200).json({
        success: true,
        message: 'Document already analyzed',
        data: {
          analysis,
        },
      });
      return;
    }

    // Create or update analysis record
    if (!analysis) {
      analysis = await DocumentAnalysis.create({
        documentId,
        analysisStatus: 'pending',
        parties: [],
        legalIssues: [],
        citedProvisions: [],
        precedents: [],
        keyFacts: [],
        arguments: {},
        courtObservations: [],
        reliefs: {},
        relationships: {},
        timeline: [],
      });
    } else {
      analysis.analysisStatus = 'in_progress';
      await analysis.save();
    }

    // Start analysis asynchronously
    analyzeDocumentWithAI(document, analysis)
      .then(() => {
        logger.info(`Document analysis completed for: ${document.fileName}`);
      })
      .catch((error) => {
        logger.error('Document analysis failed:', error);
      });

    res.status(202).json({
      success: true,
      message: 'Document analysis started',
      data: {
        analysis,
      },
    });
  } catch (error) {
    logger.error('Analyze document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start document analysis',
    });
  }
};

// Get analysis
export const getAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;

    const analysis = await DocumentAnalysis.findOne({
      where: { documentId },
      include: [
        {
          model: Document,
          as: 'document',
        },
      ],
    });

    if (!analysis) {
      res.status(404).json({
        success: false,
        message: 'Analysis not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (error) {
    logger.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analysis',
    });
  }
};

// Get analysis status
export const getAnalysisStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;

    const analysis = await DocumentAnalysis.findOne({
      where: { documentId },
      attributes: ['id', 'documentId', 'analysisStatus', 'generatedAt'],
    });

    if (!analysis) {
      res.status(404).json({
        success: false,
        message: 'Analysis not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        status: analysis.analysisStatus,
        generatedAt: analysis.generatedAt,
      },
    });
  } catch (error) {
    logger.error('Get analysis status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analysis status',
    });
  }
};

// Update analysis (manual corrections)
export const updateAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const updates = req.body;

    const analysis = await DocumentAnalysis.findOne({ where: { documentId } });

    if (!analysis) {
      res.status(404).json({
        success: false,
        message: 'Analysis not found',
      });
      return;
    }

    await analysis.update(updates);

    logger.info(`Analysis updated for document: ${documentId}`);

    res.status(200).json({
      success: true,
      message: 'Analysis updated successfully',
      data: {
        analysis,
      },
    });
  } catch (error) {
    logger.error('Update analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update analysis',
    });
  }
};

// Export analysis
export const exportAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const { format = 'json' } = req.query;

    const analysis = await DocumentAnalysis.findOne({
      where: { documentId },
      include: [
        {
          model: Document,
          as: 'document',
        },
      ],
    });

    if (!analysis) {
      res.status(404).json({
        success: false,
        message: 'Analysis not found',
      });
      return;
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="analysis-${documentId}.json"`
      );
      res.send(JSON.stringify(analysis, null, 2));
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format',
      });
    }
  } catch (error) {
    logger.error('Export analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analysis',
    });
  }
};
