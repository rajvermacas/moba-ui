# Recharts BarChart API Reference

## Overview

Recharts is a **Redefined** chart library built with React and D3, designed to help you create charts in React applications without any pain. The main principles are:

1. **Simply** deploy with React components
2. **Native** SVG support, lightweight with minimal dependencies  
3. **Declarative** components

- **Version**: 3.1.2 (Latest as of Nov 2024)
- **Official Documentation**: [recharts.org](https://recharts.org/)
- **Interactive Examples**: [recharts.org/storybook](https://recharts.org/en-US/storybook)
- **Repository**: [github.com/recharts/recharts](https://github.com/recharts/recharts)

## Installation & Setup

### npm Installation
```bash
npm install recharts react-is
```

Note: `react-is` needs to match the version of your installed `react` package.

### UMD Build
```html
<script src="https://unpkg.com/react/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/react-is/umd/react-is.production.min.js"></script>
<script src="https://unpkg.com/recharts/umd/Recharts.min.js"></script>
```

## Data Structure Requirements

### Basic Data Format
Recharts BarChart expects data as an **array of objects**:

```javascript
const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
];
```

### Solar System Example (Real Data)
```javascript
const solarSystem = [
  {
    name: 'Sun',
    orbitalDistanceKm: 0,
    radiusKm: 696340,
    massKg: 1.989e30,
    fill: '#ffa700',
  },
  {
    name: 'Mercury',
    orbitalDistanceKm: 5.791e7,
    radiusKm: 2439.7,
    massKg: 3.3e23,
    fill: '#1a1a1a',
  },
  // ... more planets
];
```

### Data Requirements
- **Array Format**: Data must be an array of objects
- **Consistent Properties**: Each object should have the same property structure
- **Numeric Values**: Values bound to YAxis must be numbers, not strings
- **Key Properties**: Each object should have a unique identifier property (e.g., 'name', 'id')

## Core BarChart API

### Basic BarChart Structure
```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={400}>
  <BarChart data={data} width={730} height={250}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="uv" fill="#8884d8" />
    <Bar dataKey="pv" fill="#82ca9d" />
  </BarChart>
</ResponsiveContainer>
```

### BarChart Component Props

#### Essential Props
- **`data`** (required): Array of objects containing chart data
- **`width`**: Chart width in pixels
- **`height`**: Chart height in pixels
- **`layout`**: `"horizontal"` or `"vertical"` (default: "vertical")
- **`margin`**: Object with `{top, right, bottom, left}` values

#### Child Components
The BarChart can contain:
- `<XAxis />` - Horizontal axis
- `<YAxis />` - Vertical axis  
- `<Bar />` - Data bars (multiple allowed)
- `<CartesianGrid />` - Background grid
- `<Tooltip />` - Interactive tooltips
- `<Legend />` - Chart legend
- `<ReferenceArea />`, `<ReferenceDot />`, `<ReferenceLine />` - Reference elements
- `<Brush />` - Data brush for zooming
- `<Customized />` - Custom components
- Valid SVG elements

## Bar Component API

### Core Bar Props
```jsx
<Bar 
  dataKey="uv"           // Required: Property name from data objects
  fill="#8884d8"         // Bar color
  radius={[4, 4, 0, 0]}  // Corner radius [topLeft, topRight, bottomLeft, bottomRight]
  barSize={30}           // Fixed bar width
  unit="kg"              // Unit suffix for tooltips
/>
```

### Critical dataKey Binding
**The `dataKey` prop is crucial** - it specifies which property from your data objects to visualize:

```javascript
// Data
const data = [
  { month: 'Jan', sales: 4000, profit: 2400 },
  { month: 'Feb', sales: 3000, profit: 1398 },
];

// Bar component usage
<Bar dataKey="sales" fill="#8884d8" />   // Shows sales values
<Bar dataKey="profit" fill="#82ca9d" />  // Shows profit values
```

### Multiple Bars
You can have multiple Bar components in a single chart:

```jsx
<BarChart data={data}>
  <XAxis dataKey="month" />
  <YAxis />
  <Bar dataKey="desktop" fill="#8884d8" />
  <Bar dataKey="mobile" fill="#82ca9d" />
</BarChart>
```

### Custom Bar Shapes
```jsx
const CustomBar = (props) => {
  const { fill, x, y, width, height } = props;
  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} />;
};

<Bar dataKey="uv" shape={<CustomBar />} />
```

## YAxis Component API

### Basic YAxis Configuration
```jsx
<YAxis 
  type="number"          // "number" (default) | "category"
  dataKey="value"        // For categorical YAxis only
  domain={['auto', 'auto']}  // Value range
  tickCount={5}          // Number of ticks
  width={100}            // Axis width
/>
```

### YAxis with Numeric Data (Default)
```jsx
// Automatic scaling based on data values
<YAxis />

// Custom domain range
<YAxis domain={[0, 'dataMax']} />
<YAxis domain={[1000, 5000]} />
<YAxis domain={['dataMin', 'dataMax + 1000']} />

// Logarithmic scale
<YAxis scale="log" domain={[1e22, 3e30]} />
```

### YAxis Tick Formatting
```jsx
// Custom formatter function
const formatYAxisTick = (value) => `${value}k`;

<YAxis tickFormatter={formatYAxisTick} />

// Example: Convert kg to yottagram
function kgToYottagram(value) {
  const yottagram = value / 1e24;
  return `${yottagram.toFixed(2)}`;
}

<YAxis tickFormatter={kgToYottagram} />
```

### YAxis with Labels
```jsx
<YAxis 
  width={100}
  label={{ 
    value: 'Mass [kg]', 
    position: 'insideLeft', 
    dx: 0, 
    dy: 20, 
    angle: -90 
  }} 
/>
```

## XAxis Component API

### Basic XAxis Configuration
```jsx
<XAxis 
  dataKey="name"         // Required: Property name for labels
  type="category"        // "category" (default) | "number"
  tickCount={5}          // Number of ticks
  angle={-45}            // Tick label rotation
/>
```

### Custom Tick Components
```jsx
const CustomAxisTick = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text 
      x={0} 
      y={0} 
      dy={16} 
      textAnchor="end" 
      fill="#666" 
      transform="rotate(-35)"
    >
      {payload.value}
    </text>
  </g>
);

<XAxis dataKey="name" tick={<CustomAxisTick />} />
```

## Horizontal Bar Charts

For horizontal layout, swap the axis types and dataKey assignments:

```jsx
<BarChart layout="horizontal" data={data}>
  <XAxis type="number" />           // Numbers on X-axis
  <YAxis type="category" dataKey="name" />  // Categories on Y-axis  
  <Bar dataKey="value" fill="#8884d8" />
</BarChart>
```

## Common Issues and Solutions

### Issue 1: Bars Showing Sequential Indices Instead of Actual Values

**Problem**: Bars display heights of 0, 1, 2, 3... instead of actual data values.

**Root Cause**: YAxis is interpreting numeric data as categorical strings.

**Solution**: Ensure data values are actual numbers, not strings:

```javascript
// ❌ Wrong - strings that look like numbers
const badData = [
  { name: 'A', value: '4000' },  // String!
  { name: 'B', value: '3000' },  // String!
];

// ✅ Correct - actual numbers
const goodData = [
  { name: 'A', value: 4000 },    // Number!
  { name: 'B', value: 3000 },    // Number!
];
```

### Issue 2: YAxis Not Scaling Properly

**Problem**: YAxis doesn't show expected range or scale.

**Solutions**:
```jsx
// Force specific domain
<YAxis domain={[0, 'dataMax']} />

// Allow data overflow for custom ranges
<YAxis domain={[1000, 5000]} allowDataOverflow />

// Use logarithmic scale for wide ranges
<YAxis scale="log" domain={[1e22, 3e30]} />
```

### Issue 3: dataKey Not Binding Correctly

**Problem**: Bars don't appear or show wrong data.

**Solution**: Ensure `dataKey` exactly matches object properties:

```javascript
const data = [{ month: 'Jan', totalSales: 4000 }];

// ❌ Wrong
<Bar dataKey="sales" />  // Property doesn't exist

// ✅ Correct  
<Bar dataKey="totalSales" />  // Matches exactly
```

## Data Formatting Requirements

### Numeric Data Validation
```javascript
// Ensure numeric values for YAxis
const processedData = rawData.map(item => ({
  ...item,
  value: typeof item.value === 'string' ? parseFloat(item.value) : item.value
}));
```

### Handle Missing Values
```javascript
const cleanData = data.filter(item => 
  item.value !== null && 
  item.value !== undefined && 
  !isNaN(item.value)
);
```

### Data Type Checking
```javascript
const validateDataType = (data, key) => {
  return data.every(item => typeof item[key] === 'number');
};

if (!validateDataType(data, 'value')) {
  console.error('Data values must be numbers for proper YAxis scaling');
}
```

## Advanced Configuration

### Responsive Container
```jsx
import { ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height="100%" aspect={500 / 300}>
  <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
    {/* chart components */}
  </BarChart>
</ResponsiveContainer>
```

### Custom Tooltips
```jsx
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
        <p className="desc">Custom tooltip content</p>
      </div>
    );
  }
  return null;
};

<Tooltip content={<CustomTooltip />} />
```

### Synchronized Charts
```jsx
import { useChartSynchronisation } from 'recharts';

// Multiple charts with synchronized interactions
const MyCharts = () => {
  const syncId = "chart-sync-group";
  
  return (
    <>
      <BarChart syncId={syncId} data={data1}>
        {/* chart 1 components */}
      </BarChart>
      <BarChart syncId={syncId} data={data2}>
        {/* chart 2 components */}
      </BarChart>
    </>
  );
};
```

## Best Practices

### Performance Tips
1. **Limit Data Points**: For large datasets, consider data pagination or sampling
2. **Use ResponsiveContainer**: Wrap charts for better responsive behavior
3. **Optimize Tooltips**: Use custom tooltips only when necessary
4. **Memoize Data**: Use React.useMemo for expensive data transformations

### Accessibility
```jsx
<BarChart accessibilityLayer data={data}>
  {/* Users can navigate with TAB and arrow keys */}
</BarChart>
```

### Error Handling
```jsx
import { ErrorBoundary } from 'react-error-boundary';

const ChartErrorFallback = ({ error }) => (
  <div>Chart failed to render: {error.message}</div>
);

<ErrorBoundary FallbackComponent={ChartErrorFallback}>
  <BarChart data={data}>
    {/* chart components */}
  </BarChart>
</ErrorBoundary>
```

## Version 3.0 Updates

### Breaking Changes
- `activeIndex` prop removed from Bar components
- Reference components: `alwaysShow` and `isFront` props removed
- Stricter TypeScript definitions
- Tooltip behavior changes for keyboard navigation

### New Features
- Custom component support without `<Customized />` wrapper
- Improved accessibility layer
- Better TypeScript support
- Enhanced state management with Redux integration

## Troubleshooting Guide

### Debug Steps for Bar Height Issues

1. **Check Data Types**:
```javascript
console.log('Data types:', data.map(d => typeof d.value));
```

2. **Verify Data Structure**:
```javascript
console.log('Data structure:', JSON.stringify(data, null, 2));
```

3. **Test YAxis Domain**:
```jsx
<YAxis domain={['dataMin', 'dataMax']} />
```

4. **Enable Console Warnings**:
```javascript
// Recharts will log warnings for data issues in development
```

### Common Error Messages

- **"dataKey not found"**: Check that dataKey matches object property names
- **"Invalid domain"**: Ensure domain values are numbers or valid domain functions
- **"Chart not rendering"**: Verify data is array of objects with consistent structure

## Additional Resources

- **Official Documentation**: [recharts.org](https://recharts.org/)
- **Interactive Examples**: [recharts.org/storybook](https://recharts.org/en-US/storybook)
- **GitHub Repository**: [github.com/recharts/recharts](https://github.com/recharts/recharts)
- **Migration Guide**: [3.0 Migration Guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide)
- **Community Discussions**: [GitHub Discussions](https://github.com/recharts/recharts/discussions)
- **Stack Overflow**: Tag `recharts` for community support

---

**Document Generated**: November 27, 2024  
**Recharts Version**: 3.1.2  
**React Compatibility**: React 16.8+ (Hooks required)  
**TypeScript Support**: Full TypeScript definitions included