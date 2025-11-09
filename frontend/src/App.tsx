import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { Dashboard } from './components/Dashboard';
import { ActivityFeed } from './components/ActivityFeed';
import  PriceDataPage  from './components/PriceDataPage';
import  GaslessTransactions  from './components/GaslessTransactions';

function App() {
  return (
    <WalletProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/activity" element={<ActivityFeed />} />
        <Route path="/prices" element={<PriceDataPage />} />
        <Route path="/gasless" element={<GaslessTransactions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </WalletProvider>
  );
}

export default App;
