import { useParams } from 'react-router-dom';
import { FileText, Users, Scale, BookOpen, Clock } from 'lucide-react';

const DocumentAnalysis = () => {
  const { documentId } = useParams();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Analysis</h1>
        <p className="mt-2 text-gray-600">AI-powered legal document analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Executive Summary
            </h2>
            <p className="text-gray-500">Analysis not yet available. Please trigger analysis.</p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-600" />
              Parties Involved
            </h2>
            <p className="text-gray-500">No parties identified yet</p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Scale className="h-5 w-5 mr-2 text-primary-600" />
              Legal Issues
            </h2>
            <p className="text-gray-500">No legal issues identified yet</p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
              Cited Provisions
            </h2>
            <p className="text-gray-500">No provisions cited yet</p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-600" />
              Timeline
            </h2>
            <p className="text-gray-500">No timeline available yet</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Analysis Status</h2>
            <div className="space-y-3">
              <div>
                <span className="badge badge-warning">Pending</span>
              </div>
              <button className="w-full btn btn-primary">
                Start Analysis
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full btn btn-secondary text-sm">
                Export as PDF
              </button>
              <button className="w-full btn btn-secondary text-sm">
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysis;
