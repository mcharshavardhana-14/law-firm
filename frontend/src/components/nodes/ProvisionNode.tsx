import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { BookOpen } from 'lucide-react';
import { LegalProvision } from '@/types';

const ProvisionNode = memo(({ data }: { data: LegalProvision }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-purple-400 bg-purple-50 w-64">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-start gap-2">
        <BookOpen className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900">{data.act}</div>
          <div className="text-xs text-purple-600 font-medium mb-2">
            Section {data.section}
          </div>

          {data.text && (
            <div className="text-xs text-gray-600 mb-2 italic">
              {data.text.slice(0, 80)}
              {data.text.length > 80 && '...'}
            </div>
          )}

          {data.applicability && (
            <div className="text-xs text-gray-700 bg-purple-100 p-2 rounded">
              <span className="font-medium">Applicability: </span>
              {data.applicability.slice(0, 60)}
              {data.applicability.length > 60 && '...'}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

ProvisionNode.displayName = 'ProvisionNode';

export default ProvisionNode;
