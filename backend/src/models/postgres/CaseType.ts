import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

interface CaseTypeAttributes {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  relevantLegalActs: string[];
  customFields: Record<string, any>;
  icon?: string;
  colorCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CaseTypeCreationAttributes extends Optional<CaseTypeAttributes, 'id'> {}

class CaseType extends Model<CaseTypeAttributes, CaseTypeCreationAttributes>
  implements CaseTypeAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public parentCategoryId?: string;
  public relevantLegalActs!: string[];
  public customFields!: Record<string, any>;
  public icon?: string;
  public colorCode?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CaseType.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parentCategoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'case_types',
        key: 'id',
      },
    },
    relevantLegalActs: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    customFields: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    colorCode: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^#[0-9A-F]{6}$/i,
      },
    },
  },
  {
    sequelize,
    tableName: 'case_types',
    timestamps: true,
  }
);

export default CaseType;
