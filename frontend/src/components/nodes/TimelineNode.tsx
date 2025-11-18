import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Clock } from 'lucide-react';
import { TimelineEvent } from '@/types';
import { format } from 'date-fns';

const TimelineNode = memo(({ data }: { data: TimelineEvent }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-pink-400 bg-pink-50 w-56">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-start gap-2">
        <Clock className="h-5 w-5 text-pink-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-pink-600 font-medium mb-1">
            {data.date ? format(new Date(data.date), 'MMM dd, yyyy') : data.date}
          </div>
          <div className="font-bold text-sm text-gray-900 mb-2">
            {data.event}
          </div>
          {data.description && (
            <div className="text-xs text-gray-600">
              {data.description.slice(0, 60)}
              {data.description.length > 60 && '...'}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

TimelineNode.displayName = 'TimelineNode';

export default TimelineNode;
