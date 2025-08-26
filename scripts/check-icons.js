const icons = require('lucide-react');

// List of icons used in the codebase
const usedIcons = [
  'Send', 'X', 'Sparkles', 'Database', 
  'ChevronLeft', 'ChevronRight', 'MessageSquare', 'BarChart3', 
  'Moon', 'Sun', 'RotateCcw', 'Trash2', 'AlertTriangle', 
  'User', 'Bot', 'Copy', 'Clock', 'AlertCircle', 'Loader2', 
  'Plus', 'ChevronsRight', 'MessageCircle', 'Grid3X3', 
  'Download', 'RefreshCw', 'Settings', 'Eye', 
  'ChevronDown', 'Edit2', 'Check', 'ScatterChart', 
  'LineChart', 'PieChart', 'AreaChart'
];

console.log('Checking icons...\n');

const missing = [];
const found = [];

usedIcons.forEach(icon => {
  if (icons[icon]) {
    found.push(icon);
  } else {
    missing.push(icon);
  }
});

if (missing.length > 0) {
  console.log('❌ Missing icons:', missing.join(', '));
} else {
  console.log('✅ All icons are valid!');
}

console.log(`\nFound ${found.length} valid icons out of ${usedIcons.length} total.`);