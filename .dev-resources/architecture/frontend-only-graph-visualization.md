# Frontend-Only Graph Visualization Requirements

## Executive Summary
Implement graph visualization purely on the frontend by analyzing the existing `query_results` data structure. No backend changes required.

## Approach
The frontend will intelligently detect data patterns and automatically choose appropriate chart types.

## Core Implementation

### 1. Auto-Detection Algorithm
```
FUNCTION: detectChartTypeFromData(query_results)
  IF no data or empty:
    RETURN null
  
  columns = extractColumns(query_results[0])
  
  # Analyze column types
  textColumns = []
  numericColumns = []
  dateColumns = []
  
  FOR each column:
    IF isNumeric(all values):
      numericColumns.add(column)
    ELIF isDate(sample values):
      dateColumns.add(column)
    ELSE:
      textColumns.add(column)
  
  # Decision logic
  IF textColumns.length == 1 AND numericColumns.length == 1:
    uniqueValues = countUnique(textColumns[0])
    IF uniqueValues <= 8:
      RETURN "pie"
    ELSE:
      RETURN "bar"
  
  IF dateColumns.length >= 1 AND numericColumns.length >= 1:
    RETURN "line"
  
  IF numericColumns.length >= 2:
    RETURN "bar"  # Multi-series bar
  
  DEFAULT:
    RETURN "bar"
```

### 2. Data Transformation
```
FUNCTION: transformDataForChart(query_results, chartType)
  IF chartType == "bar":
    # Use first non-numeric column as labels
    # Use first numeric column as values
    labels = extractFirstTextColumn(query_results)
    values = extractFirstNumericColumn(query_results)
    RETURN data.map(row => ({
      name: row[labels],
      value: row[values]
    }))
  
  IF chartType == "pie":
    # Same as bar but calculate percentages
    data = transformDataForChart(query_results, "bar")
    total = sum(data.values)
    RETURN data.map(item => ({
      ...item,
      percentage: (item.value / total * 100)
    }))
  
  IF chartType == "line":
    # Use date/first column as X
    # Use numeric column as Y
    xColumn = findDateColumn() || findFirstColumn()
    yColumn = findFirstNumericColumn()
    RETURN data.map(row => ({
      x: row[xColumn],
      y: row[yColumn]
    }))
```

### 3. Component Structure
```
GraphView/
├── ChartTypeDetector.js    # Analyzes data structure
├── DataTransformer.js       # Converts table to chart format
├── ChartRenderer.js         # Renders appropriate chart
├── AutoChart.js            # Main component that orchestrates
└── ExportButton.js         # PNG export
```

### 4. Usage Flow
```
1. User queries data → receives query_results
2. User toggles to Graph view
3. Frontend analyzes query_results structure
4. Auto-selects best chart type
5. Transforms data to chart format
6. Renders chart with Recharts
7. Optional: User can switch chart types manually
8. Optional: Export as PNG
```

### 5. Smart Defaults

#### 5.1 Column Selection Priority
```
For Labels (X-axis):
1. Column named: name, label, category, type, status
2. First text column
3. First date column
4. Row index

For Values (Y-axis):
1. Column named: value, amount, count, total, score
2. First numeric column
3. Count of occurrences (for text data)
```

#### 5.2 Chart Type Selector
```
Component: ChartTypeSelector
- Show detected chart type as default
- Dropdown with alternatives:
  * Bar Chart
  * Pie Chart  
  * Line Chart
- On selection: re-transform data and re-render
```

### 6. Implementation Code Structure

#### 6.1 Main AutoChart Component
```jsx
COMPONENT: AutoChart({ queryResults })
  STATE:
    - chartType (auto-detected or user selected)
    - chartData (transformed data)
    - availableCharts (valid chart types for this data)
  
  ON_MOUNT:
    - Detect chart type
    - Transform data
    - Set available chart options
  
  RENDER:
    <div>
      <ChartTypeSelector 
        current={chartType}
        options={availableCharts}
        onChange={handleChartTypeChange}
      />
      <ChartRenderer 
        type={chartType}
        data={chartData}
      />
      <ExportButton />
    </div>
```

### 7. Benefits of Frontend-Only Approach

1. **No backend dependencies** - Works immediately
2. **Flexible** - Can adapt to any data structure  
3. **User control** - Allow manual chart type override
4. **Fast iteration** - No API changes needed
5. **Backwards compatible** - Works with existing API

### 8. Limitations to Accept

1. **No semantic understanding** - Can't know what data "means"
2. **Basic detection** - May not always pick optimal chart
3. **No insights** - Just visualization, no analysis
4. **Generic titles** - Will use column names as labels

### 9. MVP Implementation Plan

#### Day 1-2
1. Install Recharts
2. Create ChartTypeDetector utility
3. Create DataTransformer utility

#### Day 3-4
1. Build AutoChart component
2. Add toggle to existing QueryResults
3. Implement bar chart

#### Day 5-6
1. Add pie and line charts
2. Add chart type selector dropdown

#### Day 7
1. Implement PNG export
2. Testing and refinement

### 10. Example Detection Scenarios

#### Scenario 1: Pass/Fail Data
```json
Input: [
  {"rule": "completeness", "status": "Pass", "count": 150},
  {"rule": "accuracy", "status": "Fail", "count": 50}
]
Detection: 2 text columns + 1 numeric → Bar chart
```

#### Scenario 2: Simple Metrics
```json
Input: [
  {"metric": "CPU Usage", "value": 65},
  {"metric": "Memory", "value": 80},
  {"metric": "Disk", "value": 45}
]
Detection: 1 text + 1 numeric, 3 unique values → Pie chart
```

#### Scenario 3: Time Series
```json
Input: [
  {"date": "2024-01-01", "errors": 5},
  {"date": "2024-01-02", "errors": 3}
]
Detection: Date column + numeric → Line chart
```

---

*No backend changes required - Pure frontend solution*