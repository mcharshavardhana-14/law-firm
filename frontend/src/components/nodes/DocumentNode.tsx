import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FileText } from 'lucide-react';

interface DocumentNodeData {
  documentId: string;
  executiveSummary?: string;
}

const DocumentNode = memo(({ data }: { data: DocumentNodeData }) => {
  return (
    <div className="px-6 py-4 shadow-xl rounded-lg border-2 border-gray-400 bg-white w-80">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <FileText className="h-6 w-6 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base text-gray-900 mb-1">
            Document Analysis
          </div>
          <div className="text-xs text-gray-500 mb-3">
            ID: {data.documentId.slice(0, 8)}...
          </div>

          {data.executiveSummary && (
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
              <div className="font-medium mb-1">Executive Summary:</div>
              <div className="text-xs">
                {data.executiveSummary.slice(0, 150)}
                {data.executiveSummary.length > 150 && '...'}
              </div>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

DocumentNode.displayName = 'DocumentNode';

export default DocumentNode;
