import { Response } from 'express';
import { Document, Project, User } from '../models/postgres';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';
import path from 'path';
import fs from 'fs';

// Get documents by project
export const getDocumentsByProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const documents = await Document.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['uploadDate', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        documents,
        total: documents.length,
      },
    });
  } catch (error) {
    logger.error('Get documents by project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
    });
  }
};

// Get document by ID
export const getDocumentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Project,
          as: 'project',
        },
      ],
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        document,
      },
    });
  } catch (error) {
    logger.error('Get document by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
    });
  }
};

// Upload document
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const { projectId, documentType } = req.body;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Create document record
    const document = await Document.create({
      projectId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      storageUrl: req.file.path,
      documentType: documentType || 'other',
      uploadDate: new Date(),
      uploadedBy: req.userId!,
      processingStatus: 'pending',
      metadata: {
        originalName: req.file.originalname,
        encoding: req.file.encoding,
      },
    });

    logger.info(`Document uploaded: ${req.file.originalname}`);

    // TODO: Trigger document processing job
    // This would extract text, perform OCR if needed, etc.

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document,
      },
    });
  } catch (error) {
    logger.error('Upload document error:', error);

    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        logger.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
    });
  }
};

// Upload batch documents
export const uploadBatchDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
      return;
    }

    const { projectId, documentType } = req.body;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      // Delete uploaded files
      req.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Create document records for all files
    const documents = await Promise.all(
      req.files.map((file) =>
        Document.create({
          projectId,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          storageUrl: file.path,
          documentType: documentType || 'other',
          uploadDate: new Date(),
          uploadedBy: req.userId!,
          processingStatus: 'pending',
          metadata: {
            originalName: file.originalname,
            encoding: file.encoding,
          },
        })
      )
    );

    logger.info(`Batch upload: ${req.files.length} documents`);

    res.status(201).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: {
        documents,
        total: documents.length,
      },
    });
  } catch (error) {
    logger.error('Upload batch documents error:', error);

    // Clean up uploaded files on error
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          logger.error('Error deleting file:', unlinkError);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload documents',
    });
  }
};

// Delete document
export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found',
      });
      return;
    }

    // Delete file from storage
    try {
      if (fs.existsSync(document.storageUrl)) {
        fs.unlinkSync(document.storageUrl);
      }
    } catch (fileError) {
      logger.error('Error deleting file:', fileError);
    }

    await document.destroy();

    logger.info(`Document deleted: ${document.fileName}`);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
    });
  }
};

// Download document
export const downloadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found',
      });
      return;
    }

    if (!fs.existsSync(document.storageUrl)) {
      res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
      return;
    }

    res.download(document.storageUrl, document.fileName);
  } catch (error) {
    logger.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
    });
  }
};
