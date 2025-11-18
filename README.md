# AI-Powered Legal Case Management System

A comprehensive legal case management platform designed specifically for Indian law firms to manage cases, documents, and generate intelligent case summaries with relational mapping of legal entities, precedents, and issues.

## Features

### Core Modules

1. **Case Type Management**
   - Pre-configured Indian legal case types (Civil, Criminal, Corporate, etc.)
   - Custom field definitions per case type
   - Hierarchical categorization

2. **Project Management**
   - Unlimited projects under each case type
   - Case metadata management (parties, court details, hearing dates)
   - Project timeline and task management

3. **Document Processing**
   - Support for PDF, DOCX, DOC, images
   - OCR for scanned documents
   - Batch upload capability (up to 500 pages per file)
   - Automatic document classification

4. **AI Document Analysis**
   - Entity recognition (parties, legal provisions, precedents)
   - Relationship mapping
   - Intelligent summarization
   - Legal issue identification

5. **Interactive Visualization**
   - Tree-based relational structure
   - Interactive nodes for parties, issues, provisions, precedents
   - Export and reporting capabilities

6. **Search & Discovery**
   - Full-text search across documents
   - Similar case finder
   - Precedent search engine

## Technology Stack

### Frontend
- React.js with TypeScript
- TailwindCSS for styling
- D3.js/React Flow for visualizations
- Axios for API calls

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL (structured data)
- MongoDB (document metadata)
- Redis (caching and queues)
- Elasticsearch (full-text search)

### AI/ML Services
- Claude API (Anthropic) for document analysis
- Tesseract OCR for document processing

### Storage
- AWS S3 or local file storage

## Project Structure

```
law-firm/
├── backend/           # Node.js + Express backend
├── frontend/          # React frontend
├── database/          # Database schemas and migrations
├── docs/              # Documentation
├── shared/            # Shared types and utilities
└── docker/            # Docker configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- Redis 7+
- Elasticsearch 8+

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd law-firm
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations
```bash
cd backend
npm run migrate
```

5. Start development servers
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

## Environment Variables

See `.env.example` for required environment variables.

## API Documentation

API documentation is available at `http://localhost:5000/api-docs` when running the backend in development mode.

## User Roles

- **Super Admin**: Full system access
- **Firm Admin**: Manage firm-level settings, users, case types
- **Senior Partner**: Access to all cases
- **Associate Lawyer**: Access to assigned cases
- **Paralegal**: Document upload, limited editing
- **Intern/Assistant**: View-only access

## Security

- End-to-end encryption for documents
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Audit logs for all actions

## License

Proprietary - All rights reserved

## Support

For issues and feature requests, please contact the development team.
