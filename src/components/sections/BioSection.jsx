import { useData } from '../../contexts/DataContext';

export default function BioSection() {
  const { getData, updateFile } = useData();
  const bio = getData('bio') || { photo: '', photo_alt: '', teaser: '', paragraphs: [] };

  const update = (field, value) => {
    updateFile('bio', { ...bio, [field]: value });
  };

  const updateParagraph = (i, value) => {
    const paragraphs = [...bio.paragraphs];
    paragraphs[i] = value;
    update('paragraphs', paragraphs);
  };

  const addParagraph = () => {
    update('paragraphs', [...bio.paragraphs, '']);
  };

  const removeParagraph = (i) => {
    update('paragraphs', bio.paragraphs.filter((_, j) => j !== i));
  };

  return (
    <div>
      <h2>Bio</h2>

      <fieldset className="form-section">
        <legend>Author Photo</legend>
        <label>
          Photo Path
          <input value={bio.photo || ''} onChange={(e) => update('photo', e.target.value)} />
        </label>
        {bio.photo && (
          <div className="photo-preview">
            <img
              src={`https://raw.githubusercontent.com/gstreet-ops/ellie-hallaron-website/main/src${bio.photo}`}
              alt={bio.photo_alt || 'Author photo'}
            />
          </div>
        )}
        <label>
          Alt Text
          <input value={bio.photo_alt || ''} onChange={(e) => update('photo_alt', e.target.value)} />
        </label>
      </fieldset>

      <fieldset className="form-section">
        <legend>Teaser (shown on homepage)</legend>
        <textarea
          rows={4}
          value={bio.teaser || ''}
          onChange={(e) => update('teaser', e.target.value)}
        />
      </fieldset>

      <fieldset className="form-section">
        <legend>Full Bio Paragraphs</legend>
        {bio.paragraphs.map((p, i) => (
          <div key={i} className="verse-row">
            <textarea
              rows={4}
              value={p}
              onChange={(e) => updateParagraph(i, e.target.value)}
              placeholder={`Paragraph ${i + 1}`}
            />
            <button className="btn-icon btn-danger" onClick={() => removeParagraph(i)} title="Remove">✕</button>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={addParagraph}>+ Add Paragraph</button>
      </fieldset>
    </div>
  );
}
