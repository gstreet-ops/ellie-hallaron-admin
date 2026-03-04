import { createContext, useContext, useState, useCallback } from 'react';
import { fetchAllData, saveChangedFiles } from '../lib/github';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [files, setFiles] = useState({});
  const [dirty, setDirty] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllData();
      setFiles(data);
      setDirty(new Set());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFile = useCallback((key, data) => {
    setFiles((prev) => ({
      ...prev,
      [key]: { ...prev[key], data },
    }));
    setDirty((prev) => new Set(prev).add(key));
  }, []);

  const getData = useCallback((key) => files[key]?.data, [files]);

  const saveAll = useCallback(async () => {
    if (dirty.size === 0) return;
    setSaving(true);
    try {
      const toSave = [...dirty].map((key) => files[key]);
      const results = await saveChangedFiles(toSave);
      setFiles((prev) => {
        const next = { ...prev };
        results.forEach(({ path, sha }) => {
          const key = path.replace('src/_data/', '').replace('.json', '');
          if (next[key]) next[key] = { ...next[key], sha };
        });
        return next;
      });
      setDirty(new Set());
      showToast(`Saved ${results.length} file(s). Site will update in ~60 seconds.`);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [dirty, files, showToast]);

  return (
    <DataContext.Provider
      value={{
        files,
        dirty,
        loading,
        saving,
        error,
        toast,
        loadAll,
        updateFile,
        getData,
        saveAll,
        showToast,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
