import { Plus } from 'lucide-react';

const CaseTypes = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Case Types</h1>
          <p className="mt-2 text-gray-600">Manage your case type categories</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          New Case Type
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-gray-500 text-center py-8">
            No case types configured yet
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaseTypes;
