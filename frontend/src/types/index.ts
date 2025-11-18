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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  profilePicture?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseType {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  relevantLegalActs: string[];
  customFields: Record<string, any>;
  icon?: string;
  colorCode?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface Project {
  id: string;
  caseTypeId: string;
  caseNumber: string;
  caseTitle: string;
  clientNames: string[];
  opposingParties: string[];
  courtForum?: string;
  judgeDetails?: string;
  filingDate?: string;
  hearingDates: string[];
  status: ProjectStatus;
  priority: ProjectPriority;
  assignedTeam: string[];
  tags: string[];
  createdBy: string;
  caseType?: CaseType;
  creator?: User;
  createdAt: string;
  updatedAt: string;
}

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

export interface Document {
  id: string;
  projectId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  pageCount?: number;
  storageUrl: string;
  documentType: DocumentType;
  uploadDate: string;
  uploadedBy: string;
  processingStatus: ProcessingStatus;
  extractedTextUrl?: string;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  uploader?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Party {
  name: string;
  role: string;
  representation?: string;
  claims?: string[];
  reliefs?: string[];
}

export interface LegalIssue {
  description: string;
  relevantProvisions: string[];
  connectedParties: string[];
  argumentsFor: string[];
  argumentsAgainst: string[];
  courtFinding?: string;
}

export interface LegalProvision {
  act: string;
  section: string;
  text?: string;
  applicability: string;
  connectedIssues: string[];
}

export interface Precedent {
  caseName: string;
  citation: string;
  legalPrinciple: string;
  distinguishing: boolean;
  connectedIssue: string;
  courtObservation?: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  description?: string;
}

export enum AnalysisStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface DocumentAnalysis {
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
  generatedAt?: string;
  document?: Document;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  total?: number;
}
