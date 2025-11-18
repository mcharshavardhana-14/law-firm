import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import logger from '../utils/logger';
import { Document, DocumentAnalysis } from '../models/postgres';
import { extractTextFromDocument } from './document.service';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: config.ai.anthropicApiKey,
});

interface AnalysisResult {
  parties: any[];
  legalIssues: any[];
  citedProvisions: any[];
  precedents: any[];
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
  executiveSummary: string;
  timeline: any[];
}

// Main document analysis function
export const analyzeDocumentWithAI = async (
  document: Document,
  analysis: DocumentAnalysis
): Promise<void> => {
  try {
    // Update status to in_progress
    analysis.analysisStatus = 'in_progress';
    await analysis.save();

    // Extract text from document
    const documentText = await extractTextFromDocument(document);

    if (!documentText || documentText.trim().length === 0) {
      throw new Error('No text could be extracted from document');
    }

    // Analyze document with Claude
    const analysisResult = await analyzeWithClaude(documentText);

    // Update analysis record with results
    analysis.parties = analysisResult.parties;
    analysis.legalIssues = analysisResult.legalIssues;
    analysis.citedProvisions = analysisResult.citedProvisions;
    analysis.precedents = analysisResult.precedents;
    analysis.keyFacts = analysisResult.keyFacts;
    analysis.arguments = analysisResult.arguments;
    analysis.courtObservations = analysisResult.courtObservations;
    analysis.reliefs = analysisResult.reliefs;
    analysis.relationships = analysisResult.relationships;
    analysis.executiveSummary = analysisResult.executiveSummary;
    analysis.timeline = analysisResult.timeline;
    analysis.analysisStatus = 'completed';
    analysis.generatedAt = new Date();

    await analysis.save();

    logger.info(`Document analysis completed for document: ${document.id}`);
  } catch (error) {
    logger.error('Document analysis error:', error);
    analysis.analysisStatus = 'failed';
    await analysis.save();
    throw error;
  }
};

// Analyze document text with Claude API
const analyzeWithClaude = async (documentText: string): Promise<AnalysisResult> => {
  try {
    const systemPrompt = `You are an expert Indian legal document analyzer. Analyze the provided legal document and extract structured information following Indian legal terminology and practices.

Your task is to:
1. Identify all parties involved with their roles (Petitioner, Respondent, Appellant, Accused, Witness, Intervenor, etc.)
2. Extract key facts in chronological order
3. Identify legal issues and questions of law
4. List all legal provisions cited (Acts, Sections, Articles)
5. Identify precedents cited with case names and citations
6. Extract arguments from both sides
7. Note court's observations and rulings
8. Identify reliefs sought and granted
9. Map relationships between parties, issues, and legal provisions
10. Create a comprehensive executive summary
11. Build a timeline of important events

Return the analysis as a valid JSON object with the following structure:
{
  "parties": [{"name": "string", "role": "string", "representation": "string", "claims": ["string"], "reliefs": ["string"]}],
  "legalIssues": [{"description": "string", "relevantProvisions": ["string"], "connectedParties": ["string"], "argumentsFor": ["string"], "argumentsAgainst": ["string"], "courtFinding": "string"}],
  "citedProvisions": [{"act": "string", "section": "string", "text": "string", "applicability": "string", "connectedIssues": ["string"]}],
  "precedents": [{"caseName": "string", "citation": "string", "legalPrinciple": "string", "distinguishing": boolean, "connectedIssue": "string", "courtObservation": "string"}],
  "keyFacts": ["string"],
  "arguments": {"petitioner": ["string"], "respondent": ["string"]},
  "courtObservations": ["string"],
  "reliefs": {"sought": ["string"], "granted": ["string"]},
  "relationships": {},
  "executiveSummary": "string",
  "timeline": [{"date": "string", "event": "string", "description": "string"}]
}`;

    // Split document into chunks if too long (Claude has token limits)
    const chunks = splitTextIntoChunks(documentText, 100000);

    let combinedResult: AnalysisResult = {
      parties: [],
      legalIssues: [],
      citedProvisions: [],
      precedents: [],
      keyFacts: [],
      arguments: {},
      courtObservations: [],
      reliefs: {},
      relationships: {},
      executiveSummary: '',
      timeline: [],
    };

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const userPrompt = chunks.length > 1
        ? `This is part ${i + 1} of ${chunks.length} of the document. Analyze this section:\n\n${chunk}`
        : `Analyze this legal document:\n\n${chunk}`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Extract JSON from response
      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const chunkResult = parseAnalysisResponse(responseText);

      // Merge results
      combinedResult = mergeAnalysisResults(combinedResult, chunkResult);
    }

    // If multiple chunks, generate final executive summary
    if (chunks.length > 1) {
      combinedResult.executiveSummary = await generateExecutiveSummary(combinedResult);
    }

    return combinedResult;
  } catch (error) {
    logger.error('Claude API error:', error);
    throw new Error('Failed to analyze document with AI');
  }
};

// Split text into chunks
const splitTextIntoChunks = (text: string, maxChunkSize: number): string[] => {
  const chunks: string[] = [];
  let currentChunk = '';

  const paragraphs = text.split('\n\n');

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }

      // If single paragraph is too large, split by sentences
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split('. ');
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            chunks.push(currentChunk);
            currentChunk = sentence;
          } else {
            currentChunk += (currentChunk ? '. ' : '') + sentence;
          }
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

// Parse Claude's response
const parseAnalysisResponse = (responseText: string): AnalysisResult => {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim();

    // Remove markdown code block markers if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    logger.error('Failed to parse AI response:', error);

    // Return empty result if parsing fails
    return {
      parties: [],
      legalIssues: [],
      citedProvisions: [],
      precedents: [],
      keyFacts: [],
      arguments: {},
      courtObservations: [],
      reliefs: {},
      relationships: {},
      executiveSummary: responseText.substring(0, 500),
      timeline: [],
    };
  }
};

// Merge analysis results from multiple chunks
const mergeAnalysisResults = (result1: AnalysisResult, result2: AnalysisResult): AnalysisResult => {
  return {
    parties: [...result1.parties, ...result2.parties],
    legalIssues: [...result1.legalIssues, ...result2.legalIssues],
    citedProvisions: [...result1.citedProvisions, ...result2.citedProvisions],
    precedents: [...result1.precedents, ...result2.precedents],
    keyFacts: [...result1.keyFacts, ...result2.keyFacts],
    arguments: {
      petitioner: [
        ...(result1.arguments.petitioner || []),
        ...(result2.arguments.petitioner || []),
      ],
      respondent: [
        ...(result1.arguments.respondent || []),
        ...(result2.arguments.respondent || []),
      ],
    },
    courtObservations: [...result1.courtObservations, ...result2.courtObservations],
    reliefs: {
      sought: [...(result1.reliefs.sought || []), ...(result2.reliefs.sought || [])],
      granted: [...(result1.reliefs.granted || []), ...(result2.reliefs.granted || [])],
    },
    relationships: { ...result1.relationships, ...result2.relationships },
    executiveSummary: result2.executiveSummary || result1.executiveSummary,
    timeline: [...result1.timeline, ...result2.timeline],
  };
};

// Generate executive summary from combined results
const generateExecutiveSummary = async (analysis: AnalysisResult): Promise<string> => {
  try {
    const summaryPrompt = `Based on the following legal case analysis, generate a concise 2-3 paragraph executive summary:

Parties: ${JSON.stringify(analysis.parties)}
Legal Issues: ${JSON.stringify(analysis.legalIssues)}
Key Facts: ${JSON.stringify(analysis.keyFacts)}
Reliefs: ${JSON.stringify(analysis.reliefs)}

Provide a clear, professional summary that captures the essence of the case.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: summaryPrompt,
        },
      ],
    });

    return message.content[0].type === 'text' ? message.content[0].text : '';
  } catch (error) {
    logger.error('Failed to generate executive summary:', error);
    return 'Summary generation failed';
  }
};
