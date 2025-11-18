import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export enum ProjectStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

interface ProjectAttributes {
  id: string;
  caseTypeId: string;
  caseNumber: string;
  caseTitle: string;
  clientNames: string[];
  opposingParties: string[];
  courtForum?: string;
  judgeDetails?: string;
  filingDate?: Date;
  hearingDates: Date[];
  status: ProjectStatus;
  priority: ProjectPriority;
  assignedTeam: string[];
  tags: string[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes {
  public id!: string;
  public caseTypeId!: string;
  public caseNumber!: string;
  public caseTitle!: string;
  public clientNames!: string[];
  public opposingParties!: string[];
  public courtForum?: string;
  public judgeDetails?: string;
  public filingDate?: Date;
  public hearingDates!: Date[];
  public status!: ProjectStatus;
  public priority!: ProjectPriority;
  public assignedTeam!: string[];
  public tags!: string[];
  public createdBy!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    caseTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'case_types',
        key: 'id',
      },
    },
    caseNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    caseTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clientNames: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    opposingParties: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    courtForum: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    judgeDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    filingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    hearingDates: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ProjectStatus)),
      allowNull: false,
      defaultValue: ProjectStatus.ACTIVE,
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(ProjectPriority)),
      allowNull: false,
      defaultValue: ProjectPriority.MEDIUM,
    },
    assignedTeam: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: true,
  }
);

export default Project;
