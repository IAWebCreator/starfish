import { WalletProvider } from './context/WalletContext';
import { CreateAgentProvider } from './context/CreateAgentContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import './index.css';
import './styles/Home.css';
import Home from './pages/Home';
import CreateAgent from './pages/CreateAgent';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Profile from './pages/Profile';
import WebGenerator from './pages/WebGenerator';

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <CreateAgentProvider>
          <Router>
            <ThemeToggle />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-agent" element={<CreateAgent />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/web-generator" element={<WebGenerator />} />
            </Routes>
          </Router>
        </CreateAgentProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App; 