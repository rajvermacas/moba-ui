/**
 * Custom hook for managing visualization state
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  UseVisualizationReturn, 
  VisualizationSpec, 
  ChartType,
  ChartConfiguration 
} from '@/types/visualization.types';
import { inferChartType, createDefaultConfig, validateChartConfig } from '@/utils/chartHelpers';

interface UseVisualizationOptions {
  autoInferType?: boolean;
  defaultType?: ChartType;
  onError?: (error: string) => void;
}

export const useVisualization = (
  options: UseVisualizationOptions = {}
): UseVisualizationReturn => {
  const { autoInferType = true, defaultType = 'bar', onError } = options;

  // State
  const [spec, setSpecState] = useState<VisualizationSpec | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ChartType | null>(null);

  // Actions
  const setSpec = useCallback((newSpec: VisualizationSpec) => {
    try {
      // Validate the spec
      if (!newSpec.data || newSpec.data.length === 0) {
        throw new Error('Visualization spec must contain data');
      }

      // Validate chart configuration
      const validation = validateChartConfig(
        newSpec.chart_type, 
        newSpec.config, 
        newSpec.data
      );
      
      if (!validation.valid) {
        throw new Error(`Chart configuration error: ${validation.errors.join(', ')}`);
      }

      // Auto-infer chart type if enabled and column types are provided
      let chartType = newSpec.chart_type;
      if (autoInferType && newSpec.column_types) {
        const inferredType = inferChartType(newSpec.data, newSpec.column_types);
        
        // Use inferred type if current type is not recommended or if alternatives exist
        if (!newSpec.recommended && newSpec.alternatives.includes(inferredType)) {
          chartType = inferredType;
          newSpec.chart_type = chartType;
          newSpec.recommended = true;
        }
      }

      // Create default config if none provided
      if (!newSpec.config || Object.keys(newSpec.config).length === 0) {
        newSpec.config = createDefaultConfig(chartType, newSpec.data);
      }

      setSpecState(newSpec);
      setSelectedType(chartType);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error setting visualization spec';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [autoInferType, onError]);

  const updateSelectedType = useCallback((type: ChartType) => {
    if (!spec) {
      setSelectedType(type);
      return;
    }

    try {
      // Create a new config for the selected chart type
      const newConfig = createDefaultConfig(type, spec.data);
      
      // Validate the new configuration
      const validation = validateChartConfig(type, newConfig, spec.data);
      if (!validation.valid) {
        throw new Error(`Cannot switch to ${type}: ${validation.errors.join(', ')}`);
      }

      // Update the spec with new chart type and config
      const updatedSpec: VisualizationSpec = {
        ...spec,
        chart_type: type,
        config: newConfig,
        recommended: spec.alternatives.includes(type) || spec.chart_type === type
      };

      setSpecState(updatedSpec);
      setSelectedType(type);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error changing chart type';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [spec, onError]);

  const setErrorState = useCallback((newError: string | null) => {
    setError(newError);
  }, []);

  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const resetState = useCallback(() => {
    setSpecState(null);
    setSelectedType(null);
    setError(null);
    setLoading(false);
  }, []);

  // Computed values
  const availableTypes: ChartType[] = useMemo(() => {
    if (!spec) {
      return ['bar', 'line', 'pie', 'area', 'scatter'];
    }
    
    // Return the recommended type plus alternatives
    const types = new Set<ChartType>([spec.chart_type]);
    spec.alternatives.forEach(alt => types.add(alt));
    
    return Array.from(types);
  }, [spec]);

  const currentConfig: ChartConfiguration | undefined = useMemo(() => {
    if (!spec || !selectedType) return undefined;
    
    // If selected type is different from spec type, create default config
    if (selectedType !== spec.chart_type) {
      return createDefaultConfig(selectedType, spec.data);
    }
    
    return spec.config;
  }, [spec, selectedType]);

  const isReady: boolean = useMemo(() => {
    return !!(spec && selectedType && !loading && !error);
  }, [spec, selectedType, loading, error]);

  return {
    // State
    spec,
    loading,
    error,
    selectedType,
    
    // Actions
    setSpec,
    setSelectedType: updateSelectedType,
    setError: setErrorState,
    setLoading: setLoadingState,
    resetState,

    // Computed values (additional properties not in the interface)
    availableTypes,
    currentConfig,
    isReady
  } as UseVisualizationReturn & {
    availableTypes: ChartType[];
    currentConfig?: ChartConfiguration;
    isReady: boolean;
  };
};

// Utility hook for creating visualization specs from raw data
export const useVisualizationSpec = (
  data: Record<string, any>[],
  columnTypes?: Record<string, 'numeric' | 'categorical' | 'temporal' | 'text'>
) => {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    // Infer column types if not provided
    const inferredColumnTypes = columnTypes || inferColumnTypes(data);
    
    // Infer best chart type
    const chartType = inferChartType(data, inferredColumnTypes);
    
    // Create default configuration
    const config = createDefaultConfig(chartType, data);
    
    // Create the spec
    const spec: VisualizationSpec = {
      chart_type: chartType,
      recommended: true,
      alternatives: getAlternativeChartTypes(chartType, inferredColumnTypes),
      column_types: inferredColumnTypes,
      config,
      data,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'user-provided'
      }
    };

    return spec;
  }, [data, columnTypes]);
};

// Helper function to infer column types from data
function inferColumnTypes(
  data: Record<string, any>[]
): Record<string, 'numeric' | 'categorical' | 'temporal' | 'text'> {
  if (!data.length) return {};

  const columnTypes: Record<string, 'numeric' | 'categorical' | 'temporal' | 'text'> = {};
  const firstRow = data[0];

  Object.keys(firstRow).forEach(key => {
    const values = data.map(row => row[key]).filter(val => val != null);
    
    if (values.length === 0) {
      columnTypes[key] = 'text';
      return;
    }

    // Check if numeric
    if (values.every(val => typeof val === 'number' || !isNaN(Number(val)))) {
      columnTypes[key] = 'numeric';
      return;
    }

    // Check if temporal
    if (values.some(val => {
      if (typeof val === 'string') {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }
      return false;
    })) {
      columnTypes[key] = 'temporal';
      return;
    }

    // Check if categorical (limited unique values)
    const uniqueValues = new Set(values).size;
    if (uniqueValues <= Math.max(10, data.length * 0.1)) {
      columnTypes[key] = 'categorical';
    } else {
      columnTypes[key] = 'text';
    }
  });

  return columnTypes;
}

// Helper function to get alternative chart types
function getAlternativeChartTypes(
  primaryType: ChartType,
  columnTypes: Record<string, string>
): ChartType[] {
  const alternatives: ChartType[] = [];
  const numericFields = Object.values(columnTypes).filter(type => type === 'numeric').length;
  const categoricalFields = Object.values(columnTypes).filter(type => type === 'categorical').length;
  const temporalFields = Object.values(columnTypes).filter(type => type === 'temporal').length;

  // Add alternatives based on data characteristics
  if (numericFields >= 1 && categoricalFields >= 1) {
    alternatives.push('bar', 'line');
  }
  
  if (numericFields >= 2) {
    alternatives.push('scatter');
  }
  
  if (temporalFields >= 1 && numericFields >= 1) {
    alternatives.push('line', 'area');
  }
  
  if (categoricalFields >= 1 && numericFields === 1) {
    alternatives.push('pie');
  }

  // Remove the primary type from alternatives
  return alternatives.filter(type => type !== primaryType);
}