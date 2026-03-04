import { useData } from '../../contexts/DataContext';

export default function SocialSection() {
  const { getData, updateFile } = useData();
  const social = getData('social') || [];

  const updateEntry = (i, field, value) => {
    const updated = [...social];
    updated[i] = { ...updated[i], [field]: value };
    updateFile('social', updated);
  };

  const addEntry = () => {
    updateFile('social', [...social, { name: '', handle: '', url: '', svg_path: '' }]);
  };

  const removeEntry = (i) => {
    updateFile('social', social.filter((_, j) => j !== i));
  };

  return (
    <div>
      <div className="section-header">
        <h2>Social Links</h2>
        <button className="btn btn-primary" onClick={addEntry}>+ Add Link</button>
      </div>

      {social.map((entry, i) => (
        <fieldset key={i} className="form-section">
          <legend>{entry.name || `Link ${i + 1}`}</legend>
          <div className="form-grid">
            <label>
              Platform Name
              <input value={entry.name || ''} onChange={(e) => updateEntry(i, 'name', e.target.value)} placeholder="e.g. TikTok" />
            </label>
            <label>
              Handle
              <input value={entry.handle || ''} onChange={(e) => updateEntry(i, 'handle', e.target.value)} placeholder="e.g. @EllieHallaron.Author" />
            </label>
            <label>
              URL
              <input value={entry.url || ''} onChange={(e) => updateEntry(i, 'url', e.target.value)} placeholder="https://..." />
            </label>
          </div>
          <label>
            SVG Path Data
            <textarea rows={2} value={entry.svg_path || ''} onChange={(e) => updateEntry(i, 'svg_path', e.target.value)} className="mono-input" />
          </label>
          {entry.svg_path && (
            <div className="svg-preview">
              <svg viewBox="0 0 24 24" width="32" height="32"><path d={entry.svg_path} fill="currentColor" /></svg>
              <span className="preview-label">Icon Preview</span>
            </div>
          )}
          <button className="btn btn-danger btn-sm" onClick={() => removeEntry(i)}>Remove</button>
        </fieldset>
      ))}
    </div>
  );
}
