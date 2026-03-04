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

const SITE_URL = 'https://gstreet-ops.github.io/ellie-hallaron-website/';

const SECTION_PREVIEW_MAP = {
  books: 'books/',
  bio: 'about/',
  social: 'connect/',
  settings: '',
  quiz: 'trivia/',
};

export default function Dashboard() {
  const { loadAll, loading, error } = useData();
  const [activeSection, setActiveSection] = useState('books');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(SITE_URL);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    setPreviewUrl(SITE_URL + (SECTION_PREVIEW_MAP[activeSection] || ''));
  }, [activeSection]);

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
    <div className={`dashboard ${showPreview ? 'with-preview' : ''}`}>
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
      <main className="main-content">
        <div className="main-header">
          <button
            className={`btn btn-preview ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? 'Hide preview' : 'Show live site preview'}
          >
            {showPreview ? '✕ Close Preview' : '👁 Preview Site'}
          </button>
          {showPreview && (
            <button
              className="btn btn-preview-refresh"
              onClick={() => setPreviewUrl(SITE_URL + (SECTION_PREVIEW_MAP[activeSection] || '') + '?t=' + Date.now())}
              title="Refresh preview"
            >
              ↻ Refresh
            </button>
          )}
        </div>
        <ActiveComponent />
      </main>
      {showPreview && (
        <aside className="preview-pane">
          <iframe
            src={previewUrl}
            title="Site Preview"
            className="preview-iframe"
          />
        </aside>
      )}
      <SaveButton />
      <Toast />
    </div>
  );
}
