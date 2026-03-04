import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import Sidebar from './Sidebar';
import SaveButton from './SaveButton';
import Toast from './Toast';
import BooksSection from './sections/BooksSection';
import BioSection from './sections/BioSection';
import SocialSection from './sections/SocialSection';
import SettingsSection from './sections/SettingsSection';
import QuizSection from './sections/QuizSection';

const SECTIONS = {
  books: BooksSection,
  bio: BioSection,
  social: SocialSection,
  settings: SettingsSection,
  quiz: QuizSection,
};

export default function Dashboard() {
  const { loadAll, loading, error } = useData();
  const [activeSection, setActiveSection] = useState('books');

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading site data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <p className="error-text">Error: {error}</p>
        <button className="btn btn-primary" onClick={loadAll}>Retry</button>
      </div>
    );
  }

  const ActiveComponent = SECTIONS[activeSection];

  return (
    <div className="dashboard">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
      <main className="main-content">
        <ActiveComponent />
      </main>
      <SaveButton />
      <Toast />
    </div>
  );
}
