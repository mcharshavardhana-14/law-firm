import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export enum AnalysisStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

interface Party {
  name: string;
  role: string;
  representation?: string;
  claims?: string[];
  reliefs?: string[];
}

interface LegalIssue {
  description: string;
  relevantProvisions: string[];
  connectedParties: string[];
  argumentsFor: string[];
  argumentsAgainst: string[];
  courtFinding?: string;
}

interface LegalProvision {
  act: string;
  section: string;
  text?: string;
  applicability: string;
  connectedIssues: string[];
}

interface Precedent {
  caseName: string;
  citation: string;
  legalPrinciple: string;
  distinguishing: boolean;
  connectedIssue: string;
  courtObservation?: string;
}

interface TimelineEvent {
  date: string;
  event: string;
  description?: string;
}

interface DocumentAnalysisAttributes {
  id: string;
  documentId: string;
  analysisStatus: AnalysisStatus;
  parties: Party[];
  legalIssues: LegalIssue[];
  citedProvisions: LegalProvision[];
  precedents: Precedent[];
  keyFacts: string[];
  arguments: {
    petitioner?: string[];
    respondent?: string[];
  };
  courtObservations: string[];
  reliefs: {
    sought?: string[];
    granted?: string[];
  };
  relationships: Record<string, any>;
  executiveSummary?: string;
  timeline: TimelineEvent[];
  generatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentAnalysisCreationAttributes
  extends Optional<DocumentAnalysisAttributes, 'id'> {}

class DocumentAnalysis
  extends Model<DocumentAnalysisAttributes, DocumentAnalysisCreationAttributes>
  implements DocumentAnalysisAttributes {
  public id!: string;
  public documentId!: string;
  public analysisStatus!: AnalysisStatus;
  public parties!: Party[];
  public legalIssues!: LegalIssue[];
  public citedProvisions!: LegalProvision[];
  public precedents!: Precedent[];
  public keyFacts!: string[];
  public arguments!: {
    petitioner?: string[];
    respondent?: string[];
  };
  public courtObservations!: string[];
  public reliefs!: {
    sought?: string[];
    granted?: string[];
  };
  public relationships!: Record<string, any>;
  public executiveSummary?: string;
  public timeline!: TimelineEvent[];
  public generatedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DocumentAnalysis.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    documentId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'documents',
        key: 'id',
      },
    },
    analysisStatus: {
      type: DataTypes.ENUM(...Object.values(AnalysisStatus)),
      allowNull: false,
      defaultValue: AnalysisStatus.PENDING,
    },
    parties: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    legalIssues: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    citedProvisions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    precedents: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    keyFacts: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    arguments: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    courtObservations: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    reliefs: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    relationships: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    executiveSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timeline: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    generatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'document_analysis',
    timestamps: true,
  }
);

export default DocumentAnalysis;
