# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "intern"
    },
    "token": "jwt-token"
  }
}
```

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token"
  }
}
```

### GET /auth/me

Get current authenticated user. Requires authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ }
  }
}
```

### POST /auth/change-password

Change user password. Requires authentication.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

## Case Types

### GET /case-types

Get all case types. Requires authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "caseTypes": [
      {
        "id": "uuid",
        "name": "Civil Cases",
        "description": "Civil law cases",
        "relevantLegalActs": ["CPC", "Evidence Act"],
        "customFields": {},
        "colorCode": "#3B82F6"
      }
    ],
    "total": 1
  }
}
```

### POST /case-types

Create a new case type. Requires admin authentication.

**Request Body:**
```json
{
  "name": "Civil Cases",
  "description": "Civil law cases",
  "relevantLegalActs": ["CPC", "Evidence Act"],
  "customFields": {},
  "colorCode": "#3B82F6"
}
```

### GET /case-types/:id

Get case type by ID. Requires authentication.

### PUT /case-types/:id

Update case type. Requires admin authentication.

### DELETE /case-types/:id

Delete case type. Requires admin authentication.

## Projects

### GET /projects

Get all projects. Requires authentication.

**Query Parameters:**
- `caseTypeId` (optional): Filter by case type
- `status` (optional): Filter by status (active, pending, closed, archived)
- `priority` (optional): Filter by priority (low, medium, high, urgent)

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "caseNumber": "2024/CIV/001",
        "caseTitle": "Smith vs. Jones",
        "clientNames": ["John Smith"],
        "opposingParties": ["Jane Jones"],
        "status": "active",
        "priority": "high",
        "caseType": { /* case type object */ },
        "creator": { /* user object */ }
      }
    ],
    "total": 1
  }
}
```

### POST /projects

Create a new project. Requires authentication.

**Request Body:**
```json
{
  "caseTypeId": "uuid",
  "caseNumber": "2024/CIV/001",
  "caseTitle": "Smith vs. Jones",
  "clientNames": ["John Smith"],
  "opposingParties": ["Jane Jones"],
  "courtForum": "District Court",
  "filingDate": "2024-01-15",
  "status": "active",
  "priority": "high"
}
```

### GET /projects/:id

Get project by ID. Requires authentication.

### PUT /projects/:id

Update project. Requires authentication.

### DELETE /projects/:id

Delete project. Requires authentication.

### GET /projects/:id/statistics

Get project statistics. Requires authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 5,
    "documentsByType": {
      "petition": 2,
      "evidence": 3
    },
    "totalPages": 150,
    "totalSize": 5242880,
    "hearingDates": 3,
    "nextHearing": "2024-02-15"
  }
}
```

## Documents

### GET /documents/project/:projectId

Get all documents for a project. Requires authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "fileName": "petition.pdf",
        "fileType": "application/pdf",
        "fileSize": 1048576,
        "pageCount": 25,
        "documentType": "petition",
        "processingStatus": "completed",
        "uploadDate": "2024-01-15T10:00:00Z",
        "uploader": { /* user object */ }
      }
    ],
    "total": 1
  }
}
```

### POST /documents/upload

Upload a single document. Requires authentication.

**Request Body (multipart/form-data):**
- `document`: File
- `projectId`: UUID
- `documentType`: String (petition, evidence, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": { /* document object */ }
  }
}
```

### POST /documents/upload-batch

Upload multiple documents. Requires authentication.

**Request Body (multipart/form-data):**
- `documents`: File[] (up to 10 files)
- `projectId`: UUID
- `documentType`: String

### GET /documents/:id

Get document by ID. Requires authentication.

### DELETE /documents/:id

Delete document. Requires authentication.

### GET /documents/:id/download

Download document file. Requires authentication.

## Document Analysis

### POST /analysis/:documentId/analyze

Start AI analysis of a document. Requires authentication.

**Response:**
```json
{
  "success": true,
  "message": "Document analysis started",
  "data": {
    "analysis": {
      "id": "uuid",
      "documentId": "uuid",
      "analysisStatus": "in_progress"
    }
  }
}
```

### GET /analysis/:documentId

Get analysis for a document. Requires authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "id": "uuid",
      "documentId": "uuid",
      "analysisStatus": "completed",
      "executiveSummary": "This case involves...",
      "parties": [
        {
          "name": "John Smith",
          "role": "Petitioner",
          "claims": ["Property rights violation"]
        }
      ],
      "legalIssues": [
        {
          "description": "Whether the respondent violated...",
          "relevantProvisions": ["CPC Section 9"],
          "courtFinding": "..."
        }
      ],
      "citedProvisions": [
        {
          "act": "Code of Civil Procedure",
          "section": "9",
          "applicability": "..."
        }
      ],
      "precedents": [
        {
          "caseName": "Case Name vs. Other",
          "citation": "2020 SCC 123",
          "legalPrinciple": "...",
          "distinguishing": false
        }
      ],
      "timeline": [
        {
          "date": "2023-01-15",
          "event": "Incident occurred",
          "description": "..."
        }
      ]
    }
  }
}
```

### GET /analysis/:documentId/status

Get analysis status. Requires authentication.

### PUT /analysis/:documentId

Update analysis (manual corrections). Requires authentication.

**Request Body:**
```json
{
  "parties": [ /* updated parties */ ],
  "legalIssues": [ /* updated issues */ ]
}
```

### GET /analysis/:documentId/export

Export analysis. Requires authentication.

**Query Parameters:**
- `format`: Export format (json, pdf) - default: json

## Users

### GET /users

Get all users. Requires admin authentication.

**Query Parameters:**
- `role` (optional): Filter by role
- `status` (optional): Filter by status

### POST /users

Create a new user. Requires admin authentication.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "associate_lawyer",
  "phone": "+1234567890"
}
```

### GET /users/:id

Get user by ID. Requires authentication.

### PUT /users/:id

Update user. Requires authentication (own profile) or admin.

### DELETE /users/:id

Delete user. Requires admin authentication.

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Status Codes

- `200 OK`: Successful GET, PUT, DELETE
- `201 Created`: Successful POST
- `202 Accepted`: Async operation started
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

When rate limit is exceeded:

```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```
