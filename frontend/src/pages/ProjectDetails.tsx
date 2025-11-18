import { useParams } from 'react-router-dom';
import { Upload, FileText, Activity } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Details</h1>
        <p className="mt-2 text-gray-600">View and manage project information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Project Information</h2>
            <p className="text-gray-500">Project ID: {id}</p>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Documents</h2>
              <button className="btn btn-primary">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </button>
            </div>
            <p className="text-gray-500">No documents uploaded yet</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Documents</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Team Members</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
