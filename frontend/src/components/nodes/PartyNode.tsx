import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Users } from 'lucide-react';
import { Party } from '@/types';

const PartyNode = memo(({ data }: { data: Party }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-blue-400 bg-blue-50 w-64">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-start gap-2">
        <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900 truncate">{data.name}</div>
          <div className="text-xs text-blue-600 font-medium">{data.role}</div>

          {data.representation && (
            <div className="text-xs text-gray-600 mt-1">
              Rep: {data.representation}
            </div>
          )}

          {data.claims && data.claims.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium text-gray-700">Claims:</div>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                {data.claims.slice(0, 2).map((claim, idx) => (
                  <li key={idx} className="truncate">{claim}</li>
                ))}
                {data.claims.length > 2 && (
                  <li className="text-blue-600">+{data.claims.length - 2} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

PartyNode.displayName = 'PartyNode';

export default PartyNode;
