# Backend Graph Visualization Requirements Document - Simplified

## Executive Summary
Enhance the `/chat/completions` API to include basic visualization metadata that tells the frontend which type of chart to display.

## Core Requirements

### 1. API Enhancement

#### 1.1 Current Response
```json
{
  "query_results": [...],
  "message": "Query executed successfully"
}
```

#### 1.2 Enhanced Response
```json
{
  "query_results": [...],
  "message": "Query executed successfully",
  "visualization_metadata": {
    "chart_type": "bar",  // or "pie" or "line"
    "chart_config": {
      "title": "Query Results"
    }
  }
}
```

### 2. Chart Type Detection

#### 2.1 Simple Rules Algorithm
```
FUNCTION: detectChartType(query_results)
  1. Analyze first 5 rows of data
  2. Count columns and their types
  
  IF has 2 columns (1 text + 1 numeric):
    IF unique_text_values <= 10:
      RETURN "pie"
    ELSE:
      RETURN "bar"
  
  IF has date/time column + numeric column:
    RETURN "line"
  
  DEFAULT:
    RETURN "bar"
```

#### 2.2 Column Type Detection
```
FUNCTION: detectColumnType(column_values)
  IF all values are numbers:
    RETURN "numeric"
  
  IF values match date patterns:
    RETURN "temporal"
  
  ELSE:
    RETURN "text"
```

### 3. Implementation

#### 3.1 Modified Endpoint
```python
@app.post("/chat/completions")
async def chat_completions(request: ChatRequest):
    # Execute query (existing)
    query_results = await execute_query(request.query)
    
    # Detect chart type (new)
    chart_type = detectChartType(query_results)
    
    # Build response
    return {
        "query_results": query_results,
        "message": "Query executed successfully",
        "visualization_metadata": {
            "chart_type": chart_type,
            "chart_config": {
                "title": "Query Results"
            }
        }
    }
```

### 4. LLM Integration (Optional for Phase 1)

#### 4.1 Simple Query Intent
```
ASYNC FUNCTION: getChartSuggestion(query_text, sample_data)
  prompt = f"""
  Based on this query and data sample, suggest a chart type.
  Query: {query_text}
  Data columns: {get_column_names(sample_data)}
  
  Return one of: bar, pie, line
  """
  
  response = await gemini_client.generate(
    prompt=prompt,
    max_tokens=10
  )
  
  RETURN response or "bar"  # Default fallback
```

### 5. Error Handling

#### 5.1 Fallback Strategy
```
IF visualization detection fails:
  RETURN {
    "visualization_metadata": {
      "chart_type": "bar",  // Safe default
      "chart_config": {
        "title": "Query Results"
      }
    }
  }
```

### 6. Testing Requirements

#### 6.1 Test Cases
1. Two columns (text + numeric) → Should suggest pie or bar
2. Date column + numeric → Should suggest line
3. Multiple numeric columns → Should suggest bar
4. Empty results → Should handle gracefully

### 7. Implementation Steps

#### Week 1
1. Add visualization_metadata to response
2. Implement basic chart type detection
3. Test with sample queries

#### Week 2  
1. Add LLM integration for better suggestions
2. Handle edge cases
3. Deploy to staging

### 8. No Additional Dependencies
- Use existing Python standard library
- Gemini SDK already available

---

*Document Version: 1.0 (Simplified)*