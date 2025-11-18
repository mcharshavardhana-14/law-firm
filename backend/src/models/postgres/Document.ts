import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export enum DocumentType {
  PETITION = 'petition',
  AFFIDAVIT = 'affidavit',
  EVIDENCE = 'evidence',
  JUDGMENT = 'judgment',
  ORDER = 'order',
  WRITTEN_STATEMENT = 'written_statement',
  REPLY = 'reply',
  REJOINDER = 'rejoinder',
  WITNESS_STATEMENT = 'witness_statement',
  OTHER = 'other',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

interface DocumentAttributes {
  id: string;
  projectId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  pageCount?: number;
  storageUrl: string;
  documentType: DocumentType;
  uploadDate: Date;
  uploadedBy: string;
  processingStatus: ProcessingStatus;
  extractedTextUrl?: string;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id'> {}

class Document extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes {
  public id!: string;
  public projectId!: string;
  public fileName!: string;
  public fileType!: string;
  public fileSize!: number;
  public pageCount?: number;
  public storageUrl!: string;
  public documentType!: DocumentType;
  public uploadDate!: Date;
  public uploadedBy!: string;
  public processingStatus!: ProcessingStatus;
  public extractedTextUrl?: string;
  public thumbnailUrl?: string;
  public metadata!: Record<string, any>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    pageCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    storageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentType: {
      type: DataTypes.ENUM(...Object.values(DocumentType)),
      allowNull: false,
      defaultValue: DocumentType.OTHER,
    },
    uploadDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    processingStatus: {
      type: DataTypes.ENUM(...Object.values(ProcessingStatus)),
      allowNull: false,
      defaultValue: ProcessingStatus.PENDING,
    },
    extractedTextUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'documents',
    timestamps: true,
  }
);

export default Document;
