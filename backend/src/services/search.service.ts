import { elasticsearch } from '../config/database';
import logger from '../utils/logger';
import { Document, Project, DocumentAnalysis } from '../models/postgres';

// Index names
const DOCUMENTS_INDEX = 'legal_documents';
const ANALYSIS_INDEX = 'legal_analysis';

// Create indices
export const createIndices = async () => {
  try {
    // Documents index
    const documentsExists = await elasticsearch.indices.exists({ index: DOCUMENTS_INDEX });
    if (!documentsExists) {
      await elasticsearch.indices.create({
        index: DOCUMENTS_INDEX,
        body: {
          mappings: {
            properties: {
              documentId: { type: 'keyword' },
              fileName: { type: 'text' },
              projectId: { type: 'keyword' },
              documentType: { type: 'keyword' },
              extractedText: { type: 'text' },
              uploadDate: { type: 'date' },
              metadata: { type: 'object' },
            },
          },
        },
      });
      logger.info('Documents index created');
    }

    // Analysis index
    const analysisExists = await elasticsearch.indices.exists({ index: ANALYSIS_INDEX });
    if (!analysisExists) {
      await elasticsearch.indices.create({
        index: ANALYSIS_INDEX,
        body: {
          mappings: {
            properties: {
              analysisId: { type: 'keyword' },
              documentId: { type: 'keyword' },
              projectId: { type: 'keyword' },
              parties: { type: 'nested' },
              legalIssues: { type: 'nested' },
              citedProvisions: { type: 'nested' },
              precedents: { type: 'nested' },
              keyFacts: { type: 'text' },
              executiveSummary: { type: 'text' },
              generatedAt: { type: 'date' },
            },
          },
        },
      });
      logger.info('Analysis index created');
    }
  } catch (error) {
    logger.error('Error creating indices:', error);
  }
};

// Index a document
export const indexDocument = async (document: Document, extractedText: string) => {
  try {
    await elasticsearch.index({
      index: DOCUMENTS_INDEX,
      id: document.id,
      body: {
        documentId: document.id,
        fileName: document.fileName,
        projectId: document.projectId,
        documentType: document.documentType,
        extractedText,
        uploadDate: document.uploadDate,
        metadata: document.metadata,
      },
    });

    logger.info(`Document indexed: ${document.id}`);
  } catch (error) {
    logger.error('Error indexing document:', error);
  }
};

// Index analysis
export const indexAnalysis = async (analysis: DocumentAnalysis, projectId: string) => {
  try {
    await elasticsearch.index({
      index: ANALYSIS_INDEX,
      id: analysis.id,
      body: {
        analysisId: analysis.id,
        documentId: analysis.documentId,
        projectId,
        parties: analysis.parties,
        legalIssues: analysis.legalIssues,
        citedProvisions: analysis.citedProvisions,
        precedents: analysis.precedents,
        keyFacts: analysis.keyFacts,
        executiveSummary: analysis.executiveSummary,
        generatedAt: analysis.generatedAt,
      },
    });

    logger.info(`Analysis indexed: ${analysis.id}`);
  } catch (error) {
    logger.error('Error indexing analysis:', error);
  }
};

// Search documents
export const searchDocuments = async (
  query: string,
  filters?: {
    projectId?: string;
    documentType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  },
  page = 1,
  pageSize = 20
) => {
  try {
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['fileName^2', 'extractedText', 'metadata.*'],
          fuzziness: 'AUTO',
        },
      },
    ];

    if (filters?.projectId) {
      must.push({ term: { projectId: filters.projectId } });
    }

    if (filters?.documentType) {
      must.push({ term: { documentType: filters.documentType } });
    }

    if (filters?.dateFrom || filters?.dateTo) {
      must.push({
        range: {
          uploadDate: {
            ...(filters.dateFrom && { gte: filters.dateFrom }),
            ...(filters.dateTo && { lte: filters.dateTo }),
          },
        },
      });
    }

    const result = await elasticsearch.search({
      index: DOCUMENTS_INDEX,
      body: {
        from: (page - 1) * pageSize,
        size: pageSize,
        query: {
          bool: { must },
        },
        highlight: {
          fields: {
            extractedText: {},
            fileName: {},
          },
        },
      },
    });

    return {
      total: (result.hits.total as any).value,
      hits: result.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
        highlights: hit.highlight,
        score: hit._score,
      })),
    };
  } catch (error) {
    logger.error('Error searching documents:', error);
    throw error;
  }
};

// Search analysis
export const searchAnalysis = async (
  query: string,
  filters?: {
    projectId?: string;
    partyName?: string;
    legalAct?: string;
  },
  page = 1,
  pageSize = 20
) => {
  try {
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: [
            'executiveSummary^3',
            'keyFacts^2',
            'parties.name',
            'legalIssues.description',
            'citedProvisions.act',
            'precedents.caseName',
          ],
          fuzziness: 'AUTO',
        },
      },
    ];

    if (filters?.projectId) {
      must.push({ term: { projectId: filters.projectId } });
    }

    if (filters?.partyName) {
      must.push({
        nested: {
          path: 'parties',
          query: {
            match: { 'parties.name': filters.partyName },
          },
        },
      });
    }

    if (filters?.legalAct) {
      must.push({
        nested: {
          path: 'citedProvisions',
          query: {
            match: { 'citedProvisions.act': filters.legalAct },
          },
        },
      });
    }

    const result = await elasticsearch.search({
      index: ANALYSIS_INDEX,
      body: {
        from: (page - 1) * pageSize,
        size: pageSize,
        query: {
          bool: { must },
        },
        highlight: {
          fields: {
            executiveSummary: {},
            keyFacts: {},
          },
        },
      },
    });

    return {
      total: (result.hits.total as any).value,
      hits: result.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
        highlights: hit.highlight,
        score: hit._score,
      })),
    };
  } catch (error) {
    logger.error('Error searching analysis:', error);
    throw error;
  }
};

// Find similar cases
export const findSimilarCases = async (documentId: string, limit = 10) => {
  try {
    const analysis = await DocumentAnalysis.findOne({ where: { documentId } });
    if (!analysis) {
      throw new Error('Analysis not found');
    }

    // Use More Like This query
    const result = await elasticsearch.search({
      index: ANALYSIS_INDEX,
      body: {
        size: limit,
        query: {
          more_like_this: {
            fields: ['executiveSummary', 'keyFacts', 'legalIssues.description'],
            like: [
              {
                _index: ANALYSIS_INDEX,
                _id: analysis.id,
              },
            ],
            min_term_freq: 1,
            max_query_terms: 25,
          },
        },
      },
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
      score: hit._score,
    }));
  } catch (error) {
    logger.error('Error finding similar cases:', error);
    throw error;
  }
};

// Aggregate analysis data
export const getAnalysisAggregations = async (projectId?: string) => {
  try {
    const filter = projectId ? [{ term: { projectId } }] : [];

    const result = await elasticsearch.search({
      index: ANALYSIS_INDEX,
      body: {
        size: 0,
        query: {
          bool: { filter },
        },
        aggs: {
          total_parties: {
            nested: { path: 'parties' },
            aggs: {
              party_roles: {
                terms: { field: 'parties.role.keyword' },
              },
            },
          },
          cited_acts: {
            nested: { path: 'citedProvisions' },
            aggs: {
              top_acts: {
                terms: { field: 'citedProvisions.act.keyword', size: 20 },
              },
            },
          },
          precedent_courts: {
            nested: { path: 'precedents' },
            aggs: {
              courts: {
                terms: { field: 'precedents.citation.keyword', size: 20 },
              },
            },
          },
        },
      },
    });

    return {
      totalDocuments: (result.hits.total as any).value,
      partyRoles: (result.aggregations?.total_parties as any)?.party_roles.buckets,
      topCitedActs: (result.aggregations?.cited_acts as any)?.top_acts.buckets,
      precedentCourts: (result.aggregations?.precedent_courts as any)?.courts.buckets,
    };
  } catch (error) {
    logger.error('Error getting aggregations:', error);
    throw error;
  }
};
