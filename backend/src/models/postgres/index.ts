import User from './User';
import CaseType from './CaseType';
import Project from './Project';
import Document from './Document';
import DocumentAnalysis from './DocumentAnalysis';

// Define associations
CaseType.hasMany(Project, {
  foreignKey: 'caseTypeId',
  as: 'projects',
});
Project.belongsTo(CaseType, {
  foreignKey: 'caseTypeId',
  as: 'caseType',
});

Project.hasMany(Document, {
  foreignKey: 'projectId',
  as: 'documents',
});
Document.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

User.hasMany(Project, {
  foreignKey: 'createdBy',
  as: 'projects',
});
Project.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

User.hasMany(Document, {
  foreignKey: 'uploadedBy',
  as: 'documents',
});
Document.belongsTo(User, {
  foreignKey: 'uploadedBy',
  as: 'uploader',
});

Document.hasOne(DocumentAnalysis, {
  foreignKey: 'documentId',
  as: 'analysis',
});
DocumentAnalysis.belongsTo(Document, {
  foreignKey: 'documentId',
  as: 'document',
});

export { User, CaseType, Project, Document, DocumentAnalysis };

export const models = {
  User,
  CaseType,
  Project,
  Document,
  DocumentAnalysis,
};

export default models;
