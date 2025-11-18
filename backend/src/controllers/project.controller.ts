import { Response } from 'express';
import { Project, CaseType, User, Document } from '../models/postgres';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all projects
export const getAllProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { caseTypeId, status, priority, search } = req.query;

    const where: any = {};

    if (caseTypeId) where.caseTypeId = caseTypeId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const projects = await Project.findAll({
      where,
      include: [
        {
          model: CaseType,
          as: 'caseType',
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        projects,
        total: projects.length,
      },
    });
  } catch (error) {
    logger.error('Get all projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
    });
  }
};

// Get project by ID
export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: CaseType,
          as: 'caseType',
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Document,
          as: 'documents',
        },
      ],
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    logger.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
    });
  }
};

// Create project
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      caseTypeId,
      caseNumber,
      caseTitle,
      clientNames,
      opposingParties,
      courtForum,
      judgeDetails,
      filingDate,
      hearingDates,
      status,
      priority,
      assignedTeam,
      tags,
    } = req.body;

    // Check if project with same case number exists
    const existingProject = await Project.findOne({ where: { caseNumber } });
    if (existingProject) {
      res.status(400).json({
        success: false,
        message: 'Project with this case number already exists',
      });
      return;
    }

    // Verify case type exists
    const caseType = await CaseType.findByPk(caseTypeId);
    if (!caseType) {
      res.status(404).json({
        success: false,
        message: 'Case type not found',
      });
      return;
    }

    const project = await Project.create({
      caseTypeId,
      caseNumber,
      caseTitle,
      clientNames: clientNames || [],
      opposingParties: opposingParties || [],
      courtForum,
      judgeDetails,
      filingDate,
      hearingDates: hearingDates || [],
      status: status || 'active',
      priority: priority || 'medium',
      assignedTeam: assignedTeam || [],
      tags: tags || [],
      createdBy: req.userId!,
    });

    logger.info(`Project created: ${caseNumber}`);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
    });
  }
};

// Update project
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await Project.findByPk(id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    await project.update(updates);

    logger.info(`Project updated: ${project.caseNumber}`);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    logger.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
    });
  }
};

// Delete project
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    await project.destroy();

    logger.info(`Project deleted: ${project.caseNumber}`);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    logger.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
    });
  }
};

// Get project statistics
export const getProjectStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: Document,
          as: 'documents',
        },
      ],
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    const documents = project.get('documents') as Document[];

    const statistics = {
      totalDocuments: documents.length,
      documentsByType: documents.reduce((acc: any, doc) => {
        acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
        return acc;
      }, {}),
      totalPages: documents.reduce((sum, doc) => sum + (doc.pageCount || 0), 0),
      totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0),
      hearingDates: project.hearingDates.length,
      nextHearing: project.hearingDates
        .filter((date) => new Date(date) > new Date())
        .sort()[0],
    };

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    logger.error('Get project statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
    });
  }
};
