import { useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './pages/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
}
