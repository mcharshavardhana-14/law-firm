import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import logger from '../utils/logger';
import { Document } from '../models/postgres';

// Extract text from document based on file type
export const extractTextFromDocument = async (document: Document): Promise<string> => {
  try {
    const filePath = document.storageUrl;

    if (!fs.existsSync(filePath)) {
      throw new Error('Document file not found');
    }

    const fileExtension = path.extname(document.fileName).toLowerCase();

    switch (fileExtension) {
      case '.pdf':
        return await extractTextFromPDF(filePath);
      case '.docx':
      case '.doc':
        return await extractTextFromWord(filePath);
      case '.txt':
        return fs.readFileSync(filePath, 'utf-8');
      case '.jpg':
      case '.jpeg':
      case '.png':
        return await extractTextFromImage(filePath);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  } catch (error) {
    logger.error('Text extraction error:', error);
    throw error;
  }
};

// Extract text from PDF
const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    logger.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Extract text from Word document
const extractTextFromWord = async (filePath: string): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    logger.error('Word extraction error:', error);
    throw new Error('Failed to extract text from Word document');
  }
};

// Extract text from image using OCR
const extractTextFromImage = async (filePath: string): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          logger.info(`OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    return text;
  } catch (error) {
    logger.error('OCR extraction error:', error);
    throw new Error('Failed to extract text from image');
  }
};

// Get page count from PDF
export const getPDFPageCount = async (filePath: string): Promise<number> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.numpages;
  } catch (error) {
    logger.error('PDF page count error:', error);
    return 0;
  }
};

// Validate document file
export const validateDocument = (filePath: string, maxFileSize: number, maxPages: number): { valid: boolean; error?: string } => {
  try {
    if (!fs.existsSync(filePath)) {
      return { valid: false, error: 'File not found' };
    }

    const stats = fs.statSync(filePath);

    if (stats.size > maxFileSize) {
      return { valid: false, error: 'File size exceeds maximum limit' };
    }

    // For PDFs, check page count
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      const pageCount = getPDFPageCount(filePath);
      if (pageCount > maxPages) {
        return { valid: false, error: 'Document exceeds maximum page limit' };
      }
    }

    return { valid: true };
  } catch (error) {
    logger.error('Document validation error:', error);
    return { valid: false, error: 'Failed to validate document' };
  }
};
