import './App.css';
import { WalletProvider } from './contexts/WalletContext';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <WalletProvider>
      <Dashboard />
    </WalletProvider>
  );
}

export default App;
