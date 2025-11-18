import { Response } from 'express';
import { CaseType } from '../models/postgres';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all case types
export const getAllCaseTypes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const caseTypes = await CaseType.findAll({
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: {
        caseTypes,
        total: caseTypes.length,
      },
    });
  } catch (error) {
    logger.error('Get all case types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch case types',
    });
  }
};

// Get case type by ID
export const getCaseTypeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const caseType = await CaseType.findByPk(id);

    if (!caseType) {
      res.status(404).json({
        success: false,
        message: 'Case type not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        caseType,
      },
    });
  } catch (error) {
    logger.error('Get case type by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch case type',
    });
  }
};

// Create case type
export const createCaseType = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, parentCategoryId, relevantLegalActs, customFields, icon, colorCode } = req.body;

    // Check if case type with same name exists
    const existingCaseType = await CaseType.findOne({ where: { name } });
    if (existingCaseType) {
      res.status(400).json({
        success: false,
        message: 'Case type with this name already exists',
      });
      return;
    }

    const caseType = await CaseType.create({
      name,
      description,
      parentCategoryId,
      relevantLegalActs: relevantLegalActs || [],
      customFields: customFields || {},
      icon,
      colorCode,
    });

    logger.info(`Case type created: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Case type created successfully',
      data: {
        caseType,
      },
    });
  } catch (error) {
    logger.error('Create case type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create case type',
    });
  }
};

// Update case type
export const updateCaseType = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const caseType = await CaseType.findByPk(id);

    if (!caseType) {
      res.status(404).json({
        success: false,
        message: 'Case type not found',
      });
      return;
    }

    await caseType.update(updates);

    logger.info(`Case type updated: ${caseType.name}`);

    res.status(200).json({
      success: true,
      message: 'Case type updated successfully',
      data: {
        caseType,
      },
    });
  } catch (error) {
    logger.error('Update case type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update case type',
    });
  }
};

// Delete case type
export const deleteCaseType = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const caseType = await CaseType.findByPk(id);

    if (!caseType) {
      res.status(404).json({
        success: false,
        message: 'Case type not found',
      });
      return;
    }

    await caseType.destroy();

    logger.info(`Case type deleted: ${caseType.name}`);

    res.status(200).json({
      success: true,
      message: 'Case type deleted successfully',
    });
  } catch (error) {
    logger.error('Delete case type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete case type',
    });
  }
};
