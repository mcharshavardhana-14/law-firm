import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';
import bcrypt from 'bcryptjs';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  FIRM_ADMIN = 'firm_admin',
  SENIOR_PARTNER = 'senior_partner',
  ASSOCIATE_LAWYER = 'associate_lawyer',
  PARALEGAL = 'paralegal',
  INTERN = 'intern',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  profilePicture?: string;
  firmId?: string;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public role!: UserRole;
  public status!: UserStatus;
  public phone?: string;
  public profilePicture?: string;
  public firmId?: string;
  public lastLogin?: Date;
  public loginAttempts!: number;
  public lockUntil?: Date;
  public mfaEnabled!: boolean;
  public mfaSecret?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public async incrementLoginAttempts(): Promise<void> {
    this.loginAttempts += 1;
    await this.save();
  }

  public async resetLoginAttempts(): Promise<void> {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
  }

  public toJSON(): Partial<UserAttributes> {
    const values = { ...this.get() };
    delete values.password;
    delete values.mfaSecret;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.INTERN,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      allowNull: false,
      defaultValue: UserStatus.ACTIVE,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firmId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    mfaEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    mfaSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
