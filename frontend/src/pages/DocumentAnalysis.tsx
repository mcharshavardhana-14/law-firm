import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FileText, Users, Scale, BookOpen, Clock, Download, Network } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import type { DocumentAnalysis as DocumentAnalysisType } from '@/types';
import AnalysisTree from '@/components/AnalysisTree';

const DocumentAnalysis = () => {
  const { documentId } = useParams();
  const [viewMode, setViewMode] = useState<'details' | 'tree'>('details');

  // Fetch analysis
  const { data: analysisData, isLoading, refetch } = useQuery({
    queryKey: ['analysis', documentId],
    queryFn: async () => {
      const response = await api.get(`/analysis/${documentId}`);
      return response.data.data.analysis as DocumentAnalysisType;
    },
    enabled: !!documentId,
    retry: false,
  });

  // Trigger analysis
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/analysis/${documentId}/analyze`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Analysis started! This may take a few minutes.');
      // Poll for updates
      const interval = setInterval(() => {
        refetch().then((result) => {
          if (result.data?.analysisStatus === 'completed') {
            clearInterval(interval);
            toast.success('Analysis completed!');
          } else if (result.data?.analysisStatus === 'failed') {
            clearInterval(interval);
            toast.error('Analysis failed');
          }
        });
      }, 5000);
    },
    onError: () => {
      toast.error('Failed to start analysis');
    },
  });

  // Export analysis
  const handleExport = async (format: 'json' | 'pdf') => {
    try {
      const response = await api.get(`/analysis/${documentId}/export`, {
        params: { format },
        responseType: format === 'json' ? 'blob' : 'json',
      });

      if (format === 'json') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analysis-${documentId}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Analysis exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export analysis');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const analysis = analysisData;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Analysis</h1>
        <p className="mt-2 text-gray-600">AI-powered legal document analysis</p>
      </div>

      {!analysis || analysis.analysisStatus === 'pending' ? (
        <div className="card text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Analysis Available
          </h2>
          <p className="text-gray-600 mb-6">
            Click the button below to start AI-powered analysis of this document
          </p>
          <button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            className="btn btn-primary"
          >
            {analyzeMutation.isPending ? 'Starting Analysis...' : 'Start Analysis'}
          </button>
        </div>
      ) : analysis.analysisStatus === 'in_progress' ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Analysis in Progress
          </h2>
          <p className="text-gray-600">
            AI is analyzing the document. This may take a few minutes...
          </p>
        </div>
      ) : analysis.analysisStatus === 'failed' ? (
        <div className="card text-center py-12">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Analysis Failed
          </h2>
          <p className="text-gray-600 mb-6">
            An error occurred during analysis. Please try again.
          </p>
          <button onClick={() => analyzeMutation.mutate()} className="btn btn-primary">
            Retry Analysis
          </button>
        </div>
      ) : (
        <>
          {/* View Mode Switcher */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setViewMode('details')}
              className={`btn ${viewMode === 'details' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Details View
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`btn ${viewMode === 'tree' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Network className="h-4 w-4 mr-2" />
              Tree View
            </button>
          </div>

          {viewMode === 'tree' ? (
            <div className="mb-6">
              <AnalysisTree analysis={analysis} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Executive Summary */}
                {analysis.executiveSummary && (
                  <div className="card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary-600" />
                      Executive Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {analysis.executiveSummary}
                    </p>
                  </div>
                )}

                {/* Parties Involved */}
                <div className="card">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary-600" />
                    Parties Involved
                  </h2>
                  {analysis.parties.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.parties.map((party, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 pl-4 py-2"
                        >
                          <div className="font-semibold text-gray-900">{party.name}</div>
                          <div className="text-sm text-blue-600">{party.role}</div>
                          {party.representation && (
                            <div className="text-sm text-gray-600 mt-1">
                              Representation: {party.representation}
                            </div>
                          )}
                          {party.claims && party.claims.length > 0 && (
                            <div className="mt-2">
                              <div className="text-sm font-medium text-gray-700">
                                Claims:
                              </div>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {party.claims.map((claim, idx) => (
                                  <li key={idx}>{claim}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No parties identified</p>
                  )}
                </div>

                {/* Legal Issues */}
                <div className="card">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Scale className="h-5 w-5 mr-2 text-primary-600" />
                    Legal Issues
                  </h2>
                  {analysis.legalIssues.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.legalIssues.map((issue, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="font-semibold text-gray-900 mb-2">
                            {issue.description}
                          </div>
                          {issue.relevantProvisions &&
                            issue.relevantProvisions.length > 0 && (
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">
                                  Relevant Provisions:
                                </span>{' '}
                                {issue.relevantProvisions.join(', ')}
                              </div>
                            )}
                          {issue.courtFinding && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm">
                              <span className="font-medium text-green-900">
                                Court's Finding:
                              </span>{' '}
                              <span className="text-green-800">
                                {issue.courtFinding}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No legal issues identified</p>
                  )}
                </div>

                {/* Cited Provisions */}
                <div className="card">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
                    Cited Provisions
                  </h2>
                  {analysis.citedProvisions.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.citedProvisions.map((provision, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-purple-500 pl-4 py-2"
                        >
                          <div className="font-semibold text-gray-900">
                            {provision.act}
                          </div>
                          <div className="text-sm text-purple-600">
                            Section {provision.section}
                          </div>
                          {provision.text && (
                            <div className="text-sm text-gray-600 mt-1 italic">
                              "{provision.text}"
                            </div>
                          )}
                          {provision.applicability && (
                            <div className="text-sm text-gray-700 mt-2">
                              <span className="font-medium">Applicability: </span>
                              {provision.applicability}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No provisions cited</p>
                  )}
                </div>

                {/* Precedents */}
                {analysis.precedents.length > 0 && (
                  <div className="card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
                      Precedents
                    </h2>
                    <div className="space-y-4">
                      {analysis.precedents.map((precedent, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="font-semibold text-gray-900">
                            {precedent.caseName}
                          </div>
                          <div className="text-sm text-amber-600 mb-2">
                            {precedent.citation}
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            <span className="font-medium">Legal Principle: </span>
                            {precedent.legalPrinciple}
                          </div>
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded-full ${
                              precedent.distinguishing
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {precedent.distinguishing ? 'Distinguished' : 'Followed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="card">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-600" />
                    Timeline
                  </h2>
                  {analysis.timeline.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.timeline.map((event, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-600">
                            {event.date}
                          </div>
                          <div className="flex-1 border-l-2 border-pink-500 pl-4 pb-4">
                            <div className="font-semibold text-gray-900">
                              {event.event}
                            </div>
                            {event.description && (
                              <div className="text-sm text-gray-600 mt-1">
                                {event.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No timeline available</p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-lg font-semibold mb-4">Analysis Status</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="badge badge-success">Completed</span>
                    </div>
                    {analysis.generatedAt && (
                      <div className="text-sm text-gray-600">
                        Generated:{' '}
                        {new Date(analysis.generatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold mb-4">Actions</h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full btn btn-secondary text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as JSON
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full btn btn-secondary text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as PDF
                    </button>
                  </div>
                </div>

                {/* Statistics */}
                <div className="card">
                  <h2 className="text-lg font-semibold mb-4">Statistics</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Parties</span>
                      <span className="font-semibold">{analysis.parties.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Legal Issues</span>
                      <span className="font-semibold">
                        {analysis.legalIssues.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Provisions</span>
                      <span className="font-semibold">
                        {analysis.citedProvisions.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Precedents</span>
                      <span className="font-semibold">
                        {analysis.precedents.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Timeline Events</span>
                      <span className="font-semibold">
                        {analysis.timeline.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentAnalysis;
