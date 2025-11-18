import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Scale } from 'lucide-react';
import { LegalIssue } from '@/types';

const LegalIssueNode = memo(({ data }: { data: LegalIssue }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-green-400 bg-green-50 w-64">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-start gap-2">
        <Scale className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900 mb-2">
            {data.description}
          </div>

          {data.relevantProvisions && data.relevantProvisions.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-medium text-gray-700">Provisions:</div>
              <div className="text-xs text-gray-600">
                {data.relevantProvisions.slice(0, 2).join(', ')}
                {data.relevantProvisions.length > 2 && ` +${data.relevantProvisions.length - 2}`}
              </div>
            </div>
          )}

          {data.courtFinding && (
            <div className="mt-2 p-2 bg-green-100 rounded text-xs text-gray-700">
              <span className="font-medium">Finding: </span>
              {data.courtFinding.slice(0, 60)}
              {data.courtFinding.length > 60 && '...'}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

LegalIssueNode.displayName = 'LegalIssueNode';

export default LegalIssueNode;
