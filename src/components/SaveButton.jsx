import { useData } from '../contexts/DataContext';

export default function SaveButton() {
  const { dirty, saving, saveAll } = useData();

  if (dirty.size === 0) return null;

  return (
    <button className="save-button" onClick={saveAll} disabled={saving}>
      {saving ? 'Saving...' : `Save Changes (${dirty.size})`}
    </button>
  );
}
