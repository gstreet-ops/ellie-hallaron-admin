import { useState } from 'react';
import { DataProvider } from './contexts/DataContext';
import TokenLogin from './pages/TokenLogin';
import Dashboard from './components/Dashboard';
import { hasToken } from './lib/github';

export default function App() {
  const [authenticated, setAuthenticated] = useState(hasToken());

  if (!authenticated) {
    return <TokenLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
}
