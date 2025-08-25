import { ThemeProvider } from './contexts/ThemeContext';
import { SessionProvider } from './contexts/SessionContext';
import { ChatbotDashboard } from './components/ChatbotDashboard';

function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ChatbotDashboard />
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
