/**
 * Type definitions for chat interface and API responses
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
  queryResult?: QueryResult;
  graph?: GraphData | null;
}

export interface QueryResult {
  success: boolean;
  data?: Array<Record<string, any>>;
  columns?: string[];
  error?: string;
  row_count?: number;
  execution_time?: number;
}

/**
 * Graph visualization data from backend
 */
export interface GraphData {
  chart_type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'heatmap';
  data: ChartDataPoint[];
  title: string;
  x_key?: string;
  y_key?: string;
  x_label?: string;
  y_label?: string;
  generated_at: number;
  total_records: number;
  
  // Chart-specific properties
  name_key?: string;      // For pie charts
  value_key?: string;     // For pie charts  
  fill?: string;          // For area/scatter charts
  fillOpacity?: number;   // For area charts
  stroke?: string;        // For line/area charts
  value_label?: string;   // For heatmaps
}

export type ChartDataPoint = 
  | BarChartDataPoint 
  | LineChartDataPoint 
  | PieChartDataPoint 
  | ScatterChartDataPoint
  | AreaChartDataPoint 
  | HeatmapDataPoint;

export interface BarChartDataPoint {
  name: string;          // Category label
  value: number;         // Numeric value
  color?: string;        // Bar color (optional)
}

export interface LineChartDataPoint {
  x: string | number;    // X-axis value (date, category, or number)
  y: number;             // Y-axis numeric value
}

export interface PieChartDataPoint {
  name: string;          // Slice label
  value: number;         // Slice value
  fill: string;          // Slice color
}

export interface ScatterChartDataPoint {
  x: number;             // X-axis numeric value
  y: number;             // Y-axis numeric value
}

export interface AreaChartDataPoint {
  x: string | number;    // X-axis value
  y: number;             // Y-axis numeric value
}

export interface HeatmapDataPoint {
  x: string;             // X-axis category
  y: string;             // Y-axis category
  value: number;         // Intensity value
}

export interface ChatCompletionRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string | null;
    query_result?: QueryResult;
    graph?: GraphData | null;  // NEW: Optional graph data
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ApiError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: number;
  mcp_server_status?: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  error?: string;
  fastapi_status: 'connected' | 'disconnected' | 'error';
  mcp_status: 'connected' | 'disconnected' | 'error';
}

/**
 * Session management types
 */
export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  isActive: boolean;
}

export interface SessionCreateResponse {
  success: boolean;
  thread_id: string;
  message: string;
}

export interface SessionClearResponse {
  success: boolean;
  message: string;
  thread_id: string;
  cleared_components: string[];
}

export interface SessionListResponse {
  success: boolean;
  active_sessions: string[];
  session_count: number;
}

export interface SessionState {
  sessions: Map<string, ChatSession>;
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}