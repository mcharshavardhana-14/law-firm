import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

const Projects = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">Manage your legal case projects</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card">
        <p className="text-gray-500 text-center py-8">
          No projects yet. Click "New Project" to create your first project.
        </p>
      </div>
    </div>
  );
};

export default Projects;
