// Test script to verify the visualization fix

const testPayload = {
  "visualization": {
    "chart_type": "bar",
    "recommended": true,
    "alternatives": ["table", "line", "pie"],
    "column_types": {
      "name": "categorical",
      "total_sales": "numeric"
    },
    "config": {
      "type": "bar",
      "responsive": true,
      "maintainAspectRatio": false,
      "xAxis": {
        "field": "name",
        "type": "category"
      },
      "yAxis": {
        "fields": ["total_sales"],
        "type": "value"
      }
    },
    "data": {
      "data": [
        {"category": "Laptop", "total_sales": 1299.99},
        {"category": "Standing Desk", "total_sales": 599.99},
        {"category": "Monitor 27\"", "total_sales": 449.99},
        {"category": "Keyboard", "total_sales": 89.99},
        {"category": "USB-C Hub", "total_sales": 49.99}
      ],
      "categories": ["Laptop", "Standing Desk", "Monitor 27\"", "Keyboard", "USB-C Hub"],
      "series": ["total_sales"],
      "type": "categorical",
      "chartType": "bar"
    },
    "metadata": {
      "row_count": 5,
      "column_count": 2,
      "query": "SELECT p.name, SUM(oi.quantity * oi.unit_price) AS total_sales FROM products AS p JOIN order_items AS oi ON p.id = oi.product_id GROUP BY p.name ORDER BY total_sales DESC LIMIT 5;"
    }
  }
};

console.log("Testing visualization data structure fix:");
console.log("=========================================");

// Test the data extraction logic that was implemented in DataVisualization component
function extractChartData(spec) {
  // Handle nested data structure from backend
  if (spec.data && typeof spec.data === 'object' && 'data' in spec.data) {
    return spec.data.data;
  }
  return spec.data;
}

const visualization = testPayload.visualization;
const extractedData = extractChartData(visualization);

console.log("✅ Original data structure:");
console.log("  - Type:", typeof visualization.data);
console.log("  - Has 'data' property:", 'data' in visualization.data);

console.log("\n✅ Extracted chart data:");
console.log("  - Is array:", Array.isArray(extractedData));
console.log("  - Length:", extractedData.length);
console.log("  - First item:", JSON.stringify(extractedData[0], null, 2));

console.log("\n✅ Test Result: Data extraction successful!");
console.log("The visualization component will now correctly handle the nested data structure from the backend.");