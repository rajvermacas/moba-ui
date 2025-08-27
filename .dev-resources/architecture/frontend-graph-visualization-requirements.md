# Frontend Graph Visualization Requirements Document - Simplified

## Executive Summary
Add basic graph visualization to the MOBA UI chat interface. Users can toggle between table and graph views for query results.

## Core Requirements

### 1. User Flow
1. User queries data through chat
2. Results display in table format (current behavior)
3. User clicks toggle to switch to graph view
4. Graph renders based on data structure
5. User can export graph as PNG

### 2. Component Structure
```
ChatInterface/
├── QueryResults/
│   ├── ViewToggle (Table | Graph)
│   ├── TableView (existing)
│   └── GraphView/
│       ├── ChartRenderer
│       └── ExportButton
```

### 3. Basic Functionality

#### 3.1 View Toggle
**Algorithm:**
```
1. Display toggle switch: [Table] [Graph]
2. Default to Table view
3. On Graph selection:
   - Hide table
   - Show graph
   - Use first recommended chart type from backend
4. Maintain toggle state during session
```

#### 3.2 Chart Rendering
**Algorithm:**
```
FUNCTION: renderChart(query_results, visualization_metadata)
  1. Read chart_type from metadata (bar, pie, line)
  2. Transform query_results to chart format:
     - Extract labels from first column
     - Extract values from numeric columns
     - Format as Recharts data structure
  3. Render appropriate Recharts component
  4. Apply basic styling from theme
```

#### 3.3 Export to PNG
**Algorithm:**
```
1. On Export button click:
   - Convert chart to canvas
   - Generate PNG
   - Download as "chart_[timestamp].png"
```

### 4. Data Transformation

#### 4.1 Simple Format Conversion
**Algorithm:**
```
FUNCTION: transformToChartData(table_data, chart_type)
  IF chart_type == "bar":
    - Use first text column as labels
    - Use first numeric column as values
    - Return [{name: label, value: number}, ...]
  
  IF chart_type == "pie":
    - Same as bar chart
    - Calculate percentages
  
  IF chart_type == "line":
    - Use first column as X axis
    - Use numeric column as Y axis
    - Return [{x: label, y: value}, ...]
```

### 5. Technical Stack

#### 5.1 Dependencies
```json
{
  "recharts": "^2.10.0",
  "html2canvas": "^1.4.1"
}
```

#### 5.2 Chart Components Needed
- BarChart
- PieChart  
- LineChart
- ResponsiveContainer
- Tooltip

### 6. API Response Expected
```json
{
  "query_results": [...],
  "visualization_metadata": {
    "chart_type": "bar",  // or "pie" or "line"
    "chart_config": {
      "title": "Query Results"
    }
  }
}
```

### 7. Implementation Steps

#### Week 1
1. Install Recharts
2. Create GraphView component
3. Add view toggle
4. Implement basic bar chart

#### Week 2
1. Add pie and line charts
2. Implement export to PNG
3. Basic error handling

### 8. Minimal Viable Product
- Toggle between table and graph
- Display bar, pie, or line chart based on backend recommendation
- Export chart as PNG
- Responsive layout

---

*Document Version: 1.0 (Simplified)*