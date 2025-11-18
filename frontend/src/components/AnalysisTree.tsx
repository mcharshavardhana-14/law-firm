import React, { useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DocumentAnalysis } from '@/types';
import PartyNode from './nodes/PartyNode';
import LegalIssueNode from './nodes/LegalIssueNode';
import ProvisionNode from './nodes/ProvisionNode';
import PrecedentNode from './nodes/PrecedentNode';
import TimelineNode from './nodes/TimelineNode';
import DocumentNode from './nodes/DocumentNode';

interface AnalysisTreeProps {
  analysis: DocumentAnalysis;
}

const nodeTypes = {
  party: PartyNode,
  legalIssue: LegalIssueNode,
  provision: ProvisionNode,
  precedent: PrecedentNode,
  timeline: TimelineNode,
  document: DocumentNode,
};

const AnalysisTree: React.FC<AnalysisTreeProps> = ({ analysis }) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let yOffset = 0;
    const nodeWidth = 250;
    const nodeHeight = 100;
    const horizontalSpacing = 350;
    const verticalSpacing = 150;

    // Root node - Document
    nodes.push({
      id: 'document-root',
      type: 'document',
      position: { x: 500, y: yOffset },
      data: {
        documentId: analysis.documentId,
        executiveSummary: analysis.executiveSummary,
      },
    });

    yOffset += verticalSpacing;

    // Level 1 - Parties Branch
    const partiesRootId = 'parties-root';
    nodes.push({
      id: partiesRootId,
      position: { x: 100, y: yOffset },
      data: { label: '👥 Parties' },
      style: {
        background: '#3B82F6',
        color: 'white',
        fontWeight: 'bold',
        padding: 10,
        borderRadius: 8,
      },
    });

    edges.push({
      id: 'e-doc-parties',
      source: 'document-root',
      target: partiesRootId,
      animated: true,
    });

    // Add party nodes
    analysis.parties.forEach((party, index) => {
      const partyId = `party-${index}`;
      nodes.push({
        id: partyId,
        type: 'party',
        position: { x: 100, y: yOffset + verticalSpacing + index * (nodeHeight + 20) },
        data: party,
      });

      edges.push({
        id: `e-parties-${partyId}`,
        source: partiesRootId,
        target: partyId,
      });
    });

    // Level 2 - Legal Issues Branch
    const issuesRootId = 'issues-root';
    nodes.push({
      id: issuesRootId,
      position: { x: 100 + horizontalSpacing, y: yOffset },
      data: { label: '⚖️ Legal Issues' },
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: 'bold',
        padding: 10,
        borderRadius: 8,
      },
    });

    edges.push({
      id: 'e-doc-issues',
      source: 'document-root',
      target: issuesRootId,
      animated: true,
    });

    // Add legal issue nodes
    analysis.legalIssues.forEach((issue, index) => {
      const issueId = `issue-${index}`;
      nodes.push({
        id: issueId,
        type: 'legalIssue',
        position: {
          x: 100 + horizontalSpacing,
          y: yOffset + verticalSpacing + index * (nodeHeight + 20),
        },
        data: issue,
      });

      edges.push({
        id: `e-issues-${issueId}`,
        source: issuesRootId,
        target: issueId,
      });
    });

    // Level 3 - Legal Provisions Branch
    const provisionsRootId = 'provisions-root';
    nodes.push({
      id: provisionsRootId,
      position: { x: 100 + horizontalSpacing * 2, y: yOffset },
      data: { label: '📜 Legal Provisions' },
      style: {
        background: '#8B5CF6',
        color: 'white',
        fontWeight: 'bold',
        padding: 10,
        borderRadius: 8,
      },
    });

    edges.push({
      id: 'e-doc-provisions',
      source: 'document-root',
      target: provisionsRootId,
      animated: true,
    });

    // Add provision nodes
    analysis.citedProvisions.forEach((provision, index) => {
      const provisionId = `provision-${index}`;
      nodes.push({
        id: provisionId,
        type: 'provision',
        position: {
          x: 100 + horizontalSpacing * 2,
          y: yOffset + verticalSpacing + index * (nodeHeight + 20),
        },
        data: provision,
      });

      edges.push({
        id: `e-provisions-${provisionId}`,
        source: provisionsRootId,
        target: provisionId,
      });
    });

    // Level 4 - Precedents Branch
    const precedentsRootId = 'precedents-root';
    nodes.push({
      id: precedentsRootId,
      position: { x: 100 + horizontalSpacing * 3, y: yOffset },
      data: { label: '📚 Precedents' },
      style: {
        background: '#F59E0B',
        color: 'white',
        fontWeight: 'bold',
        padding: 10,
        borderRadius: 8,
      },
    });

    edges.push({
      id: 'e-doc-precedents',
      source: 'document-root',
      target: precedentsRootId,
      animated: true,
    });

    // Add precedent nodes
    analysis.precedents.forEach((precedent, index) => {
      const precedentId = `precedent-${index}`;
      nodes.push({
        id: precedentId,
        type: 'precedent',
        position: {
          x: 100 + horizontalSpacing * 3,
          y: yOffset + verticalSpacing + index * (nodeHeight + 20),
        },
        data: precedent,
      });

      edges.push({
        id: `e-precedents-${precedentId}`,
        source: precedentsRootId,
        target: precedentId,
      });
    });

    // Level 5 - Timeline Branch
    const timelineRootId = 'timeline-root';
    const timelineYOffset = yOffset + verticalSpacing * 2;
    nodes.push({
      id: timelineRootId,
      position: { x: 500, y: timelineYOffset },
      data: { label: '📅 Timeline' },
      style: {
        background: '#EC4899',
        color: 'white',
        fontWeight: 'bold',
        padding: 10,
        borderRadius: 8,
      },
    });

    edges.push({
      id: 'e-doc-timeline',
      source: 'document-root',
      target: timelineRootId,
      animated: true,
    });

    // Add timeline nodes
    analysis.timeline.forEach((event, index) => {
      const timelineId = `timeline-${index}`;
      nodes.push({
        id: timelineId,
        type: 'timeline',
        position: {
          x: 200 + index * 200,
          y: timelineYOffset + verticalSpacing,
        },
        data: event,
      });

      if (index === 0) {
        edges.push({
          id: `e-timeline-${timelineId}`,
          source: timelineRootId,
          target: timelineId,
        });
      } else {
        edges.push({
          id: `e-timeline-${timelineId}`,
          source: `timeline-${index - 1}`,
          target: timelineId,
        });
      }
    });

    // Create relationship edges between connected nodes
    analysis.legalIssues.forEach((issue, issueIndex) => {
      issue.connectedParties?.forEach((partyName) => {
        const partyIndex = analysis.parties.findIndex((p) => p.name === partyName);
        if (partyIndex !== -1) {
          edges.push({
            id: `e-rel-party${partyIndex}-issue${issueIndex}`,
            source: `party-${partyIndex}`,
            target: `issue-${issueIndex}`,
            style: { stroke: '#94A3B8', strokeDasharray: '5,5' },
            label: 'related',
          });
        }
      });

      issue.relevantProvisions?.forEach((provisionRef) => {
        const provisionIndex = analysis.citedProvisions.findIndex(
          (p) => `${p.act} ${p.section}` === provisionRef
        );
        if (provisionIndex !== -1) {
          edges.push({
            id: `e-rel-issue${issueIndex}-provision${provisionIndex}`,
            source: `issue-${issueIndex}`,
            target: `provision-${provisionIndex}`,
            style: { stroke: '#94A3B8', strokeDasharray: '5,5' },
            label: 'cites',
          });
        }
      });
    });

    return { nodes, edges };
  }, [analysis]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[800px] bg-gray-50 rounded-lg border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'party') return '#3B82F6';
            if (n.type === 'legalIssue') return '#10B981';
            if (n.type === 'provision') return '#8B5CF6';
            if (n.type === 'precedent') return '#F59E0B';
            if (n.type === 'timeline') return '#EC4899';
            return '#64748B';
          }}
          nodeColor={(n) => {
            if (n.type === 'party') return '#DBEAFE';
            if (n.type === 'legalIssue') return '#D1FAE5';
            if (n.type === 'provision') return '#EDE9FE';
            if (n.type === 'precedent') return '#FEF3C7';
            if (n.type === 'timeline') return '#FCE7F3';
            return '#F1F5F9';
          }}
          nodeBorderRadius={8}
        />
      </ReactFlow>
    </div>
  );
};

export default AnalysisTree;
