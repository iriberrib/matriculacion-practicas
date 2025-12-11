import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { toPng } from 'html-to-image';
import { correlativitiesService, type CorrelativitiesGraph, type SubjectNodeState } from '../services/correlativities.service';
import { enrollmentsService } from '../services/enrollments.service';
import { SubjectNode, type SubjectNodeData } from './SubjectNode';
import { MapControls } from './MapControls';

interface CorrelativitiesMapProps {
  studentId: string;
  careerId: string;
  onEnroll?: (subjectId: string) => void;
}

const nodeTypes = {
  subjectNode: SubjectNode
};

export function CorrelativitiesMap({ studentId, careerId, onEnroll }: CorrelativitiesMapProps) {
  const [graph, setGraph] = useState<CorrelativitiesGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Controls state
  const [visibleStates, setVisibleStates] = useState<Set<SubjectNodeState>>(
    new Set(['COMPLETED', 'ENROLLED', 'AVAILABLE', 'LOCKED'])
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  // Cargar grafo de correlatividades
  useEffect(() => {
    loadGraph();
  }, [studentId, careerId]);

  const loadGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const graphData = await correlativitiesService.getGraphForStudent(studentId, careerId);
      setGraph(graphData);
    } catch (err) {
      console.error('Error loading correlativities graph:', err);
      setError('Error al cargar el mapa de correlatividades');
    } finally {
      setLoading(false);
    }
  };

  // Process graph and apply layout & filters
  useEffect(() => {
    if (!graph) return;

    // 1. Calculate Layout (for ALL nodes to keep positions stable)
    // -----------------------------------------------------------
    const nodesByYearSemester = new Map<string, typeof graph.nodes>();
    graph.nodes.forEach(node => {
      const key = `${node.year}-${node.semester}`;
      if (!nodesByYearSemester.has(key)) {
        nodesByYearSemester.set(key, []);
      }
      nodesByYearSemester.get(key)!.push(node);
    });

    const allFlowNodes: Node<SubjectNodeData>[] = [];
    let yOffset = 0;
    const yearSemesterKeys = Array.from(nodesByYearSemester.keys()).sort();

    const xSpacing = 350;
    const ySpacing = 280;

    const getOptimalXPosition = (node: typeof graph.nodes[0]): number => {
      const predecessors = graph.edges
        .filter(edge => edge.target === node.id)
        .map(edge => allFlowNodes.find(n => n.id === edge.source))
        .filter(Boolean);

      if (predecessors.length === 0) return 0;

      const avgX = predecessors.reduce((sum, pred) => sum + (pred?.position.x || 0), 0) / predecessors.length;
      return avgX;
    };

    yearSemesterKeys.forEach((key, layerIndex) => {
      const nodesInGroup = nodesByYearSemester.get(key)!;

      const nodePositions = nodesInGroup.map((node, index) => {
        const initialX = -(nodesInGroup.length - 1) * xSpacing / 2 + index * xSpacing;
        return { node, x: initialX, index };
      });

      if (layerIndex > 0) {
        nodePositions.forEach(np => {
          const optimalX = getOptimalXPosition(np.node);
          if (optimalX !== 0) {
            np.x = (np.x + optimalX) / 2;
          }
        });
        nodePositions.sort((a, b) => a.x - b.x);

        const startX = -(nodePositions.length - 1) * xSpacing / 2;
        nodePositions.forEach((np, idx) => {
          np.x = startX + idx * xSpacing;
        });
      }

      nodePositions.forEach(({ node }) => {
        const finalX = nodePositions.find(np => np.node.id === node.id)!.x;
        allFlowNodes.push({
          id: node.id,
          type: 'subjectNode',
          position: {
            x: finalX,
            y: yOffset
          },
          data: {
            label: node.name,
            state: node.state,
            year: node.year,
            semester: node.semester,
            capacity: node.capacity,
            current_enrollment: node.current_enrollment,
            highlighted: false
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        });
      });

      yOffset += ySpacing;
    });

    // 2. Apply Filters & Highlight
    // -----------------------------------------------------------
    const filteredNodes = allFlowNodes.filter(node =>
      visibleStates.has(node.data.state)
    );

    // Apply search highlighting
    const finalNodes = filteredNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        highlighted: searchTerm && node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
      }
    }));

    setNodes(finalNodes);

    // Filter edges: only if both source and target are visible
    const visibleNodeIds = new Set(finalNodes.map(n => n.id));
    const flowEdges: Edge[] = graph.edges
      .filter(edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target))
      .map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'default',
        animated: edge.isEnabled,
        style: {
          stroke: edge.isEnabled ? '#10b981' : '#9ca3af',
          strokeWidth: edge.isEnabled ? 2.5 : 1.5,
          opacity: 0.8
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edge.isEnabled ? '#10b981' : '#9ca3af',
          width: 20,
          height: 20
        }
      }));

    setEdges(flowEdges);

  }, [graph, visibleStates, searchTerm, setNodes, setEdges]);

  // Search effect: focus on matched node
  useEffect(() => {
    if (!searchTerm || !reactFlowInstance) return;

    const matchedNode = nodes.find(node =>
      node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matchedNode) {
      reactFlowInstance.fitView({
        nodes: [{ id: matchedNode.id }],
        padding: 0.5,
        duration: 800
      });
    }
  }, [searchTerm, reactFlowInstance, nodes.length]); // nodes.length dependency to run after filter update

  // Handlers
  const handleToggleState = (state: SubjectNodeState) => {
    setVisibleStates(prev => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });
  };

  const handleExport = async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    try {
      setExporting(true);
      // Wait for controls to hide if we wanted to hide them, but requirement didn't specify.
      // We'll capture everything inside the react-flow div.

      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        quality: 1.0,
        filter: (node) => {
          // Exclude controls from screenshot if possible
          if (node.classList?.contains('react-flow__controls') ||
            node.classList?.contains('react-flow__minimap')) {
            return false;
          }
          return true;
        }
      });

      const link = document.createElement('a');
      link.download = `mapa-correlatividades-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error al exportar el mapa');
    } finally {
      setExporting(false);
    }
  };

  const handleResetView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
      setSearchTerm('');
    }
  };

  // Manejar click en nodo
  const onNodeClick = useCallback(
    async (_event: React.MouseEvent, node: Node<SubjectNodeData>) => {
      const nodeData = graph?.nodes.find(n => n.id === node.id);
      if (!nodeData) return;

      if (nodeData.state === 'AVAILABLE') {
        if (confirm(`¿Deseas inscribirte a ${nodeData.name}?`)) {
          try {
            await enrollmentsService.create({
              student_id: studentId,
              subject_id: node.id,
              status: 'active'
            });
            await loadGraph();
            if (onEnroll) onEnroll(node.id);
          } catch (err) {
            console.error('Error enrolling:', err);
            alert('Error al inscribirse a la materia');
          }
        }
      } else if (nodeData.state === 'LOCKED') {
        const prereqNames = nodeData.prerequisites
          .map(id => graph?.nodes.find(n => n.id === id)?.name)
          .filter(Boolean)
          .join(', ');
        alert(`Esta materia requiere aprobar: ${prereqNames}`);
      }
    },
    [graph, studentId, onEnroll]
  );

  const nodeColor = (node: Node<SubjectNodeData>) => {
    switch (node.data.state) {
      case 'COMPLETED': return '#10b981';
      case 'ENROLLED': return '#f59e0b';
      case 'AVAILABLE': return '#3b82f6';
      default: return '#9ca3af';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Cargando mapa de correlatividades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadGraph}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-gray-600">
          <BookOpen className="w-8 h-8 mx-auto mb-2" />
          <p>No hay materias disponibles para esta carrera</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-280px)] min-h-[700px] bg-gray-50/50 rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
      <MapControls
        visibleStates={visibleStates}
        onToggleState={handleToggleState}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExport={handleExport}
        onResetView={handleResetView}
        exporting={exporting}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.3,
          maxZoom: 1.5
        }}
        minZoom={0.2}
        maxZoom={2.0}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="bg-gray-50"
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls className="!bg-white/80 !backdrop-blur-md !border-gray-200 !shadow-lg !rounded-lg !m-4" />
        <MiniMap
          nodeColor={nodeColor}
          className="!bg-white/80 !backdrop-blur-md !border-gray-200 !shadow-lg !rounded-lg !m-4"
          maskColor="rgba(240, 242, 245, 0.7)"
        />
      </ReactFlow>

      {/* Leyenda mejorada */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-4 border border-gray-200/50 max-w-xs transition-opacity opacity-50 hover:opacity-100">
        <div className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Leyenda</div>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-3 group">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm ring-2 ring-green-100 group-hover:ring-green-200 transition-all"></div>
            <span className="text-gray-600 font-medium">Aprobada</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm ring-2 ring-yellow-100 group-hover:ring-yellow-200 transition-all"></div>
            <span className="text-gray-600 font-medium">Cursando</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all"></div>
            <span className="text-gray-600 font-medium">Disponible para inscribir</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400 shadow-sm ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all"></div>
            <span className="text-gray-600 font-medium">Bloqueada / No disponible</span>
          </div>
          <div className="h-px bg-gray-200 my-2"></div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 leading-tight">
              Las flechas indican correlatividades necesarias para cursar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
