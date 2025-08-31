# Chart Color Scheme Control Guide

## Overview
All charts strictly follow one of two predefined color schemes:
1. **`professional-mixed`** (default) - Soft professional palette with red, amber, green, black, and gray shades
2. **`black-white-gray-red`** - Monochrome palette with red accents

## Current Default
**PROFESSIONAL-MIXED** is the default scheme used when no scheme is specified.

## How to Control Color Schemes

### 1. Component Level (Manual Control)
```tsx
import { ChatGraphRenderer } from '@/components/charts/ChatGraphRenderer';

// Default - uses professional-mixed
<ChatGraphRenderer graphData={chartData} />

// Explicit scheme selection
<ChatGraphRenderer 
  graphData={chartData} 
  colorScheme="black-white-gray-red" 
/>
```

### 2. Global Configuration Options

#### Option A: Environment Variable
```bash
# In .env file
REACT_APP_CHART_COLOR_SCHEME=black-white-gray-red
```

#### Option B: Context Provider
```tsx
// Create a ColorSchemeContext
const ColorSchemeContext = createContext('professional-mixed');

// Use in app
<ColorSchemeProvider value="black-white-gray-red">
  <ChatGraphRenderer graphData={chartData} />
</ColorSchemeProvider>
```

#### Option C: User Settings/Preferences
```tsx
// Store in user preferences
const userSettings = {
  chartColorScheme: 'black-white-gray-red'
};

<ChatGraphRenderer 
  graphData={chartData} 
  colorScheme={userSettings.chartColorScheme} 
/>
```

## Color Scheme Details

### Red-Amber-Green Scheme
- **Primary**: Red (#dc2626)
- **Secondary**: Amber (#f59e0b)  
- **Tertiary**: Green (#16a34a)
- **Usage**: Ideal for performance data (red=bad, amber=warning, green=good)

### Black-White-Gray-Red Scheme  
- **Primary**: Black (#000000)
- **Secondary**: White (#ffffff)
- **Tertiary**: Gray (#6b7280)
- **Quaternary**: Red (#dc2626)
- **Usage**: Ideal for monochrome/professional displays

## Implementation Status
- ✅ All chart components support color scheme prop
- ✅ Default scheme is red-amber-green
- ✅ No backward compatibility - individual colors are ignored
- ✅ Test panel includes interactive scheme switcher