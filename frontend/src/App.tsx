import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { Dashboard } from './components/Dashboard';
import { ActivityFeed } from './components/ActivityFeed';

function App() {
  return (
    <WalletProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/activity" element={<ActivityFeed />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </WalletProvider>
  );
}

export default App;
