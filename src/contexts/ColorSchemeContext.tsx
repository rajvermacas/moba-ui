import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChartColorScheme } from '@/utils/chartTheme';

interface ColorSchemeContextType {
  colorScheme: ChartColorScheme;
  setColorScheme: (scheme: ChartColorScheme) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

interface ColorSchemeProviderProps {
  children: ReactNode;
  defaultScheme?: ChartColorScheme;
}

export const ColorSchemeProvider: React.FC<ColorSchemeProviderProps> = ({ 
  children, 
  defaultScheme = 'professional-mixed' 
}) => {
  const [colorScheme, setColorScheme] = useState<ChartColorScheme>(defaultScheme);

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = () => {
  const context = useContext(ColorSchemeContext);
  if (context === undefined) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
};