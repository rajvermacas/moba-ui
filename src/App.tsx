import { ThemeProvider } from './contexts/ThemeContext';
import { SessionProvider } from './contexts/SessionContext';
import { ColorSchemeProvider } from './contexts/ColorSchemeContext';
import { ChatbotDashboard } from './components/ChatbotDashboard';

function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ColorSchemeProvider defaultScheme="professional-mixed">
          <ChatbotDashboard />
        </ColorSchemeProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
