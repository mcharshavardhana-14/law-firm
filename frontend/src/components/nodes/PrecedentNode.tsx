import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Library } from 'lucide-react';
import { Precedent } from '@/types';

const PrecedentNode = memo(({ data }: { data: Precedent }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-amber-400 bg-amber-50 w-64">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-start gap-2">
        <Library className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900 mb-1">
            {data.caseName}
          </div>
          <div className="text-xs text-amber-600 font-medium mb-2">
            {data.citation}
          </div>

          <div className="mb-2">
            <div className="text-xs font-medium text-gray-700">Legal Principle:</div>
            <div className="text-xs text-gray-600">
              {data.legalPrinciple.slice(0, 80)}
              {data.legalPrinciple.length > 80 && '...'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                data.distinguishing
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {data.distinguishing ? 'Distinguished' : 'Followed'}
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

PrecedentNode.displayName = 'PrecedentNode';

export default PrecedentNode;
