import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { DocumentAnalysis, Document as DocumentModel } from '../models/postgres';
import logger from '../utils/logger';

export const generateAnalysisPDF = async (
  analysis: DocumentAnalysis,
  document: DocumentModel
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const timestamp = Date.now();
      const fileName = `analysis-${analysis.documentId}-${timestamp}.pdf`;
      const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);

      // Ensure reports directory exists
      const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(24)
        .font('Helvetica-Bold')
        .text('Legal Document Analysis Report', { align: 'center' });

      doc.moveDown();
      doc.fontSize(10)
        .font('Helvetica')
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.moveDown(2);

      // Document Information
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('Document Information');

      doc.moveDown(0.5);
      doc.fontSize(10)
        .font('Helvetica')
        .text(`File Name: ${document.fileName}`)
        .text(`Document Type: ${document.documentType}`)
        .text(`Upload Date: ${new Date(document.uploadDate).toLocaleString()}`)
        .text(`Pages: ${document.pageCount || 'N/A'}`);

      doc.moveDown(2);

      // Executive Summary
      if (analysis.executiveSummary) {
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('Executive Summary');

        doc.moveDown(0.5);
        doc.fontSize(10)
          .font('Helvetica')
          .text(analysis.executiveSummary, { align: 'justify' });

        doc.moveDown(2);
      }

      // Parties Involved
      if (analysis.parties.length > 0) {
        doc.addPage();
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('Parties Involved');

        doc.moveDown(0.5);

        analysis.parties.forEach((party, index) => {
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text(`${index + 1}. ${party.name}`);

          doc.fontSize(10)
            .font('Helvetica')
            .text(`Role: ${party.role}`);

          if (party.representation) {
            doc.text(`Representation: ${party.representation}`);
          }

          if (party.claims && party.claims.length > 0) {
            doc.text('Claims:');
            party.claims.forEach((claim: string) => {
              doc.text(`  • ${claim}`, { indent: 20 });
            });
          }

          doc.moveDown();
        });

        doc.moveDown();
      }

      // Legal Issues
      if (analysis.legalIssues.length > 0) {
        doc.addPage();
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('Legal Issues');

        doc.moveDown(0.5);

        analysis.legalIssues.forEach((issue, index) => {
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text(`Issue ${index + 1}`);

          doc.fontSize(10)
            .font('Helvetica')
            .text(issue.description, { align: 'justify' });

          if (issue.relevantProvisions && issue.relevantProvisions.length > 0) {
            doc.text(`Relevant Provisions: ${issue.relevantProvisions.join(', ')}`);
          }

          if (issue.courtFinding) {
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text('Court\'s Finding:');
            doc.font('Helvetica').text(issue.courtFinding, { align: 'justify' });
          }

          doc.moveDown();
        });
      }

      // Cited Provisions
      if (analysis.citedProvisions.length > 0) {
        doc.addPage();
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('Cited Legal Provisions');

        doc.moveDown(0.5);

        analysis.citedProvisions.forEach((provision, index) => {
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text(`${provision.act} - Section ${provision.section}`);

          doc.fontSize(10)
            .font('Helvetica');

          if (provision.text) {
            doc.text(`Text: ${provision.text}`, { align: 'justify' });
          }

          if (provision.applicability) {
            doc.text(`Applicability: ${provision.applicability}`, { align: 'justify' });
          }

          doc.moveDown();
        });
      }

      // Precedents
      if (analysis.precedents.length > 0) {
        doc.addPage();
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('Precedents');

        doc.moveDown(0.5);

        analysis.precedents.forEach((precedent, index) => {
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text(`${precedent.caseName}`);

          doc.fontSize(10)
            .font('Helvetica')
            .text(`Citation: ${precedent.citation}`)
            .text(`Legal Principle: ${precedent.legalPrinciple}`, { align: 'justify' })
            .text(`Status: ${precedent.distinguishing ? 'Distinguished' : 'Followed'}`);

          if (precedent.courtObservation) {
            doc.text(`Observation: ${precedent.courtObservation}`, { align: 'justify' });
          }

          doc.moveDown();
        });
      }

      // Timeline
      if (analysis.timeline.length > 0) {
        doc.addPage();
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('Timeline of Events');

        doc.moveDown(0.5);

        analysis.timeline.forEach((event, index) => {
          doc.fontSize(10)
            .font('Helvetica-Bold')
            .text(`${event.date} - ${event.event}`);

          if (event.description) {
            doc.font('Helvetica')
              .text(event.description, { align: 'justify', indent: 20 });
          }

          doc.moveDown(0.5);
        });
      }

      // Footer on all pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        doc.fontSize(8)
          .font('Helvetica')
          .text(
            `Page ${i + 1} of ${range.count}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );

        doc.text(
          'Generated by Legal Case Management System',
          50,
          doc.page.height - 35,
          { align: 'center' }
        );
      }

      doc.end();

      stream.on('finish', () => {
        logger.info(`PDF generated: ${filePath}`);
        resolve(filePath);
      });

      stream.on('error', (error) => {
        logger.error('PDF generation error:', error);
        reject(error);
      });
    } catch (error) {
      logger.error('PDF generation error:', error);
      reject(error);
    }
  });
};
