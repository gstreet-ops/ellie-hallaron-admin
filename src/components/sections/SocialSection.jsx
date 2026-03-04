import { useState } from 'react';
import { useData } from '../../contexts/DataContext';

const PLATFORM_ICONS = {
  TikTok:
    'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.65a8.28 8.28 0 0 0 4.76 1.5V6.72a4.83 4.83 0 0 1-1-.03z',
  Instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.07 4.07 0 0 1 1.512.986 4.07 4.07 0 0 1 .986 1.512c.163.46.35 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.34 4.34 0 0 1-2.498 2.498c-.46.163-1.26.35-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.07 4.07 0 0 1-1.512-.986 4.07 4.07 0 0 1-.986-1.512c-.163-.46-.35-1.26-.403-2.43C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43a4.07 4.07 0 0 1 .986-1.512A4.07 4.07 0 0 1 5.134 2.22c.46-.163 1.26-.35 2.43-.403C8.83 1.76 9.21 1.748 12 1.748V2.163zM12 0C8.741 0 8.333.014 7.053.072 5.775.13 4.903.333 4.14.63a5.88 5.88 0 0 0-2.126 1.384A5.88 5.88 0 0 0 .63 4.14C.333 4.903.13 5.775.072 7.053.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.058 1.278.261 2.15.558 2.913a5.88 5.88 0 0 0 1.384 2.126A5.88 5.88 0 0 0 4.14 23.37c.763.297 1.635.5 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.278-.058 2.15-.261 2.913-.558a6.14 6.14 0 0 0 3.51-3.51c.297-.763.5-1.635.558-2.913C23.986 15.667 24 15.259 24 12s-.014-3.667-.072-4.947c-.058-1.278-.261-2.15-.558-2.913a5.88 5.88 0 0 0-1.384-2.126A5.88 5.88 0 0 0 19.86.63C19.097.333 18.225.13 16.947.072 15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z',
  Goodreads:
    'M11.43 23.995c-3.608-.208-6.274-2.077-6.448-5.078.695.007 1.375-.013 2.07-.006.224 1.342 1.065 2.43 2.683 3.026 1.583.496 3.737.46 5.082-.174 1.486-.71 2.27-2.168 2.395-3.893.12-.96.095-1.919.095-2.893h-.049c-.38.755-.834 1.425-1.544 1.98-1.004.742-2.128 1.04-3.282 1.068-3.27.086-6.208-1.723-6.852-5.745-.477-2.981.157-5.563 2.306-7.464C9.373 3.47 10.994 3.009 12.71 3.01c1.32.003 2.432.369 3.406 1.1.577.433 1.02.962 1.42 1.56h.065V3.37h1.985V18.222c.05 2.467-.466 4.437-2.363 5.86-1.416 1.044-3.316 1.33-5.793.913zm5.065-9.478c.168-.774.168-2.998 0-3.772-.49-2.26-1.956-3.744-4.268-3.744-2.312 0-3.778 1.484-4.268 3.744-.168.774-.168 2.998 0 3.772.49 2.26 1.956 3.744 4.268 3.744 2.312 0 3.778-1.484 4.268-3.744z',
  Amazon:
    'M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705a.66.66 0 0 1-.753.077c-1.06-.878-1.248-1.284-1.828-2.119-1.746 1.78-2.983 2.312-5.246 2.312-2.68 0-4.764-1.654-4.764-4.966 0-2.586 1.402-4.345 3.397-5.205 1.73-.754 4.147-.889 5.994-1.096v-.409c0-.753.058-1.642-.385-2.292-.384-.579-1.117-.819-1.765-.819-1.198 0-2.265.615-2.526 1.89a.547.547 0 0 1-.473.472l-2.65-.286a.463.463 0 0 1-.389-.546C6.23 1.874 9.137.5 11.753.5c1.347 0 3.108.357 4.17 1.375 1.346 1.267 1.218 2.96 1.218 4.803v4.35c0 1.308.542 1.881 1.052 2.588a.55.55 0 0 1-.017.756c-.723.602-2.008 1.724-2.715 2.351l-.017.072zM21.1 21.1c-1.735 1.326-4.253 2.033-6.42 2.033-3.038 0-5.773-1.123-7.84-2.992-.163-.147-.017-.347.178-.233 2.235 1.3 4.998 2.082 7.855 2.082 1.926 0 4.043-.399 5.99-1.224.294-.126.54.193.237.334zm.679-.774c-.221-.284-1.466-.134-2.025-.068-.17.02-.196-.128-.043-.234.991-.697 2.617-.497 2.806-.263.19.238-.05 1.882-.98 2.668-.143.121-.279.057-.216-.103.21-.524.68-1.716.458-2z',
  Facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  'X (Twitter)':
    'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  YouTube:
    'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  Pinterest:
    'M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z',
  BookBub:
    'M1.16 18.77c.6 1.56 2.2 2.47 4.12 2.47 2.76 0 4.58-1.88 4.58-4.66 0-2.55-1.69-4.36-4.14-4.36-1.44 0-2.58.55-3.27 1.55V8.56l4.58-4.65H1.17V2.74h8.73v1.2L6.52 7.33c2.89.37 4.87 2.62 4.87 5.36 0 3.47-2.64 5.96-6.1 5.96-2.87 0-4.87-1.45-5.55-3.7l1.42-.18zm11.33 0c.6 1.56 2.2 2.47 4.12 2.47 2.76 0 4.58-1.88 4.58-4.66 0-2.55-1.69-4.36-4.14-4.36-1.44 0-2.58.55-3.27 1.55V8.56l4.58-4.65h-5.86V2.74h8.73v1.2l-3.38 3.39c2.89.37 4.87 2.62 4.87 5.36 0 3.47-2.64 5.96-6.1 5.96-2.87 0-4.87-1.45-5.55-3.7l1.42-.18z',
  Threads:
    'M12.186 24h-.007C5.461 23.994.055 18.586.055 12.006S5.46.018 12.18.018c6.72 0 12.18 5.406 12.18 12.068 0 6.572-5.373 11.908-12.174 11.914zm5.892-13.91c-.18-3.868-2.092-6.136-5.892-6.136-3.276 0-5.568 2.052-5.892 5.268h2.328c.18-1.92 1.464-3.18 3.564-3.18 2.244 0 3.456 1.404 3.564 3.864v.252c-1.14-.564-2.46-.852-3.852-.852-3.036 0-5.148 1.704-5.148 4.212 0 2.556 1.98 4.284 4.884 4.284 2.016 0 3.504-.852 4.296-2.4.06.744.144 1.452.276 2.148h2.184c-.276-1.32-.384-2.784-.384-4.356V14.1l.072-3.01zM14.034 17.1c-1.632 0-2.724-.852-2.724-2.148 0-1.392 1.02-2.22 2.904-2.22 1.2 0 2.292.276 3.264.792-.18 2.268-1.488 3.576-3.444 3.576z',
};

const PLATFORM_NAMES = Object.keys(PLATFORM_ICONS);

function detectPlatform(entry) {
  if (!entry.svg_path) return '';
  const match = PLATFORM_NAMES.find((p) => PLATFORM_ICONS[p] === entry.svg_path);
  return match || 'Custom';
}

function SocialCard({ entry, index, onUpdate, onRemove }) {
  const detected = detectPlatform(entry);
  const [selectedPlatform, setSelectedPlatform] = useState(detected);
  const [showCustomSvg, setShowCustomSvg] = useState(detected === 'Custom');

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    if (platform === 'Custom') {
      setShowCustomSvg(true);
    } else {
      setShowCustomSvg(false);
      onUpdate(index, {
        ...entry,
        name: platform,
        svg_path: PLATFORM_ICONS[platform],
      });
    }
  };

  const updateField = (field, value) => {
    onUpdate(index, { ...entry, [field]: value });
  };

  const svgPath = entry.svg_path || '';

  return (
    <fieldset className="form-section">
      <legend style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {svgPath && (
          <svg viewBox="0 0 24 24" width="20" height="20" style={{ verticalAlign: 'middle' }}>
            <path d={svgPath} fill="currentColor" />
          </svg>
        )}
        {entry.name || `Link ${index + 1}`}
      </legend>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <label style={{ flex: 1 }}>
          Platform
          <select
            value={selectedPlatform}
            onChange={(e) => handlePlatformChange(e.target.value)}
          >
            <option value="">— Select —</option>
            {PLATFORM_NAMES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option value="Custom">Custom</option>
          </select>
        </label>
        {svgPath && (
          <svg viewBox="0 0 24 24" width="32" height="32" style={{ color: 'var(--magenta)', flexShrink: 0, marginTop: '1.2rem' }}>
            <path d={svgPath} fill="currentColor" />
          </svg>
        )}
      </div>

      <div className="form-grid">
        <label>
          Platform Name
          <input
            value={entry.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. TikTok"
          />
        </label>
        <label>
          Handle
          <input
            value={entry.handle || ''}
            onChange={(e) => updateField('handle', e.target.value)}
            placeholder="e.g. @EllieHallaron.Author"
          />
        </label>
      </div>
      <label style={{ marginBottom: '0.75rem' }}>
        URL
        <input
          value={entry.url || ''}
          onChange={(e) => updateField('url', e.target.value)}
          placeholder="https://..."
        />
      </label>

      {showCustomSvg && (
        <details open style={{ marginBottom: '0.75rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem' }}>
            Advanced: Custom Icon SVG
          </summary>
          <textarea
            rows={2}
            value={entry.svg_path || ''}
            onChange={(e) => updateField('svg_path', e.target.value)}
            className="mono-input"
            placeholder="M12 2c5.523..."
          />
        </details>
      )}

      <button className="btn btn-danger btn-sm" onClick={() => onRemove(index)}>Remove</button>
    </fieldset>
  );
}

export default function SocialSection() {
  const { getData, updateFile } = useData();
  const social = getData('social') || [];

  const updateEntry = (i, updatedEntry) => {
    const updated = [...social];
    updated[i] = updatedEntry;
    updateFile('social', updated);
  };

  const addEntry = () => {
    const usedNames = new Set(social.map((e) => e.name));
    const firstUnused = PLATFORM_NAMES.find((p) => !usedNames.has(p)) || '';
    const newEntry = firstUnused
      ? { name: firstUnused, handle: '', url: '', svg_path: PLATFORM_ICONS[firstUnused] }
      : { name: '', handle: '', url: '', svg_path: '' };
    updateFile('social', [...social, newEntry]);
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
        <SocialCard
          key={i}
          entry={entry}
          index={i}
          onUpdate={updateEntry}
          onRemove={removeEntry}
        />
      ))}
    </div>
  );
}
