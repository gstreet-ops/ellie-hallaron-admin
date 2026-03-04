import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { supabase } from '../../lib/supabase';
import {
  SOURCES, getSourceById, computeEqualSplit, buildPrompt, parseCSV,
} from '../../lib/promptBuilder';

const COMMUNITY_SLUG = 'ellie-hallaron';

const EMPTY_QUESTION = {
  question_text: '',
  correct_answer: '',
  incorrect_answers: ['', '', ''],
  category: '',
  difficulty: 'medium',
  explanation: '',
};

const COLOR_FIELDS = [
  { key: 'bg', label: 'Background Color' },
  { key: 'surface', label: 'Surface Color' },
  { key: 'primary', label: 'Primary Color' },
  { key: 'accent', label: 'Accent Color' },
  { key: 'text', label: 'Text Color' },
];

const PLATFORMS = ['Twitter/X', 'Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'Other'];

const SOURCE_FIELDS = {
  'web-search': [
    { name: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., The Syndicate Series by Ellie Hallaron', required: true },
    { name: 'focusArea', label: 'Focus Areas', type: 'text', placeholder: 'e.g., characters, plot twists, key scenes' },
  ],
  'website': [
    { name: 'url', label: 'URL', type: 'url', placeholder: 'https://example.com/article', required: true },
    { name: 'focusArea', label: 'Focus On', type: 'text', placeholder: 'e.g., specific section or topic' },
  ],
  'youtube': [
    { name: 'url', label: 'Video URL', type: 'url', placeholder: 'https://youtube.com/watch?v=...', required: true },
    { name: 'focusArea', label: 'Focus On', type: 'text', placeholder: 'e.g., key moments, topics discussed' },
  ],
  'document': [
    { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Paste your document text here...', rows: 8 },
    { name: 'contextHint', label: 'What is this about?', type: 'text', placeholder: 'e.g., Vengeful Vows — Chapter 5' },
  ],
  'data-file': [
    { name: 'dataDescription', label: 'What does this data contain?', type: 'text', placeholder: 'e.g., character list with descriptions' },
  ],
  'study-notes': [
    { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Paste your notes here...', rows: 8 },
    { name: 'contextHint', label: 'Subject', type: 'text', placeholder: 'e.g., Syndicate Series lore' },
  ],
  'social-media': [
    { name: 'platform', label: 'Platform', type: 'select', options: PLATFORMS, required: true },
    { name: 'accountName', label: 'Account Name', type: 'text', placeholder: 'e.g., @EllieHallaron.Author', required: true },
    { name: 'content', label: 'Pasted Posts', type: 'textarea', placeholder: 'Paste social media posts here...', rows: 8 },
  ],
};

const INITIAL_SETTINGS = {
  category: 'General Knowledge',
  customCategory: '',
  questionCount: 20,
  difficultySplit: 'equal',
  easyCount: 7,
  mediumCount: 7,
  hardCount: 6,
  includeExplanations: true,
  additionalInstructions: '',
};

const COUNT_OPTIONS = [10, 20, 30, 60];

/* ──────────────────────────────────────────────
   COLOR INPUT
   ────────────────────────────────────────────── */

function ColorInput({ label, value, onChange }) {
  return (
    <label>
      {label}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
        <span style={{
          display: 'inline-block', width: 24, height: 24,
          background: value || '#ccc', border: '1px solid #ccc',
          borderRadius: 4, marginLeft: 8, flexShrink: 0,
        }} />
      </div>
    </label>
  );
}

/* ──────────────────────────────────────────────
   AREA 1 — Quiz Settings (quiz.json via GitHub)
   ────────────────────────────────────────────── */

function QuizSettings() {
  const { getData, updateFile } = useData();
  const quiz = getData('quiz');
  if (!quiz) return <p>Loading quiz settings...</p>;

  const update = (path, value) => {
    const next = structuredClone(quiz);
    const keys = path.split('.');
    let obj = next;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    updateFile('quiz', next);
  };

  return (
    <>
      <fieldset className="form-section">
        <legend>Quiz Section Content</legend>
        <label>
          Heading
          <input value={quiz.heading || ''} onChange={(e) => update('heading', e.target.value)} />
        </label>
        <label style={{ marginTop: '0.75rem' }}>
          Description (supports HTML)
          <textarea rows={3} value={quiz.description || ''} onChange={(e) => update('description', e.target.value)} />
        </label>
      </fieldset>
      <fieldset className="form-section">
        <legend>Quiz Appearance</legend>
        <div className="form-grid">
          {COLOR_FIELDS.map(({ key, label }) => (
            <ColorInput key={key} label={label} value={quiz.theme?.[key] || ''} onChange={(v) => update(`theme.${key}`, v)} />
          ))}
        </div>
        <label style={{ marginTop: '0.75rem' }}>
          Font Family
          <input value={quiz.theme?.font || ''} onChange={(e) => update('theme.font', e.target.value)} placeholder="Google Fonts name, e.g. Lato" />
        </label>
      </fieldset>
      <fieldset className="form-section">
        <legend>Quiz Behavior</legend>
        <div className="form-grid">
          <label>
            Questions per Round
            <select value={quiz.behavior?.count ?? 10} onChange={(e) => update('behavior.count', Number(e.target.value))}>
              <option value={5}>5</option><option value={10}>10</option><option value={15}>15</option><option value={20}>20</option>
            </select>
          </label>
          <label>
            Difficulty
            <select value={quiz.behavior?.difficulty || 'mixed'} onChange={(e) => update('behavior.difficulty', e.target.value)}>
              <option value="mixed">Mixed</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </label>
          <label>
            Timer in Seconds
            <input type="number" min={0} value={quiz.behavior?.timer ?? 0} onChange={(e) => update('behavior.timer', Number(e.target.value))} placeholder="0 = no timer" />
          </label>
          <label>
            Category Filter
            <input value={quiz.behavior?.category || ''} onChange={(e) => update('behavior.category', e.target.value)} placeholder="all = show all" />
          </label>
        </div>
      </fieldset>
    </>
  );
}

/* ──────────────────────────────────────────────
   QUESTION GENERATOR WIZARD (Modal)
   ────────────────────────────────────────────── */

const STEP_LABELS = ['Source', 'Details', 'Settings', 'Generate'];

function GeneratorWizard({ communityCategories, onClose, onImportCSV }) {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState(null);
  const [sourceInput, setSourceInput] = useState({});
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSourceSelect = (id) => { setSource(id); setSourceInput({}); setStep(2); };

  const handleGenerate = () => {
    setOutput(buildPrompt(source, sourceInput, settings));
    setStep(4);
  };

  const handleReset = () => {
    setStep(1); setSource(null); setSourceInput({}); setOutput(null);
    const split = computeEqualSplit(20);
    setSettings({ ...INITIAL_SETTINGS, easyCount: split.easy, mediumCount: split.medium, hardCount: split.hard });
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(output.prompt); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Source input validation
  const fields = SOURCE_FIELDS[source] || [];
  const sourceValid = fields.filter(f => f.required).every(f => sourceInput[f.name]?.trim());

  // Settings validation
  const { difficultySplit, easyCount, mediumCount, hardCount, questionCount, category, customCategory } = settings;
  const customTotal = easyCount + mediumCount + hardCount;
  const splitValid = difficultySplit === 'equal' || customTotal === questionCount;
  const categoryValid = category !== 'Custom' || customCategory.trim();
  const equalSplit = computeEqualSplit(questionCount);

  const updateSettings = (patch) => setSettings(s => ({ ...s, ...patch }));

  const handleCountChange = (count) => {
    const split = computeEqualSplit(count);
    updateSettings({ questionCount: count, easyCount: split.easy, mediumCount: split.medium, hardCount: split.hard });
  };

  const handleDifficultyToggle = (mode) => {
    if (mode === 'custom' && difficultySplit !== 'custom') {
      const split = computeEqualSplit(questionCount);
      updateSettings({ difficultySplit: 'custom', easyCount: split.easy, mediumCount: split.medium, hardCount: split.hard });
    } else {
      updateSettings({ difficultySplit: mode });
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Generate Questions with AI</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '1.5rem' }}>
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div style={{ width: 32, height: 2, background: done ? 'var(--magenta)' : 'var(--border)', margin: '0 4px' }} />}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700,
                    background: active ? 'var(--magenta)' : done ? 'var(--magenta)' : 'var(--border)',
                    color: active || done ? '#fff' : '#888',
                  }}>
                    {done ? '\u2713' : n}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: active ? 'var(--magenta)' : '#888' }}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 1: Source */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>What will your questions be based on?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {SOURCES.map((src) => (
                <button
                  key={src.id}
                  className={`btn ${source === src.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flexDirection: 'column', padding: '0.75rem', textAlign: 'center', height: 'auto' }}
                  onClick={() => handleSourceSelect(src.id)}
                >
                  <span style={{ fontSize: '1.5rem' }}>{src.icon}</span>
                  <strong style={{ fontSize: '0.8rem' }}>{src.label}</strong>
                  <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.7 }}>{src.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Source details */}
        {step === 2 && source && (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
              {getSourceById(source)?.icon} {getSourceById(source)?.label} Details
            </p>
            {fields.map((field, i) => (
              <label key={field.name || i} style={{ marginBottom: '0.75rem' }}>
                {field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                {field.type === 'textarea' ? (
                  <textarea rows={field.rows || 4} value={sourceInput[field.name] || ''} onChange={(e) => setSourceInput({ ...sourceInput, [field.name]: e.target.value })} placeholder={field.placeholder} />
                ) : field.type === 'select' ? (
                  <select value={sourceInput[field.name] || ''} onChange={(e) => setSourceInput({ ...sourceInput, [field.name]: e.target.value })}>
                    <option value="">Select...</option>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={field.type === 'url' ? 'url' : 'text'} value={sourceInput[field.name] || ''} onChange={(e) => setSourceInput({ ...sourceInput, [field.name]: e.target.value })} placeholder={field.placeholder} />
                )}
              </label>
            ))}
            <div className="btn-row" style={{ marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!sourceValid}>Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div>
            <label style={{ marginBottom: '0.75rem' }}>
              Category
              <select value={category} onChange={(e) => updateSettings({ category: e.target.value, customCategory: '' })}>
                {communityCategories.length > 0
                  ? communityCategories.map(c => <option key={c} value={c}>{c}</option>)
                  : ['General Knowledge', 'Characters', 'Vengeful Vows', 'Deceptive Desires', 'Innocent Intentions', 'Series', 'About the Author'].map(c => <option key={c} value={c}>{c}</option>)
                }
                <option value="Custom">Custom</option>
              </select>
            </label>
            {category === 'Custom' && (
              <label style={{ marginBottom: '0.75rem' }}>
                Custom Category
                <input value={customCategory} onChange={(e) => updateSettings({ customCategory: e.target.value })} placeholder="Enter category name" />
              </label>
            )}

            <label style={{ marginBottom: '0.75rem' }}>Number of Questions</label>
            <div className="btn-row" style={{ marginBottom: '0.75rem' }}>
              {COUNT_OPTIONS.map(n => (
                <button key={n} className={`btn ${questionCount === n ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => handleCountChange(n)}>{n}</button>
              ))}
            </div>

            <label style={{ marginBottom: '0.5rem' }}>Difficulty Distribution</label>
            <div className="btn-row" style={{ marginBottom: '0.5rem' }}>
              <button className={`btn ${difficultySplit === 'equal' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => handleDifficultyToggle('equal')}>Equal</button>
              <button className={`btn ${difficultySplit === 'custom' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => handleDifficultyToggle('custom')}>Custom</button>
            </div>
            {difficultySplit === 'equal' ? (
              <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.75rem' }}>{equalSplit.easy} Easy / {equalSplit.medium} Medium / {equalSplit.hard} Hard</p>
            ) : (
              <div className="form-grid" style={{ marginBottom: '0.75rem' }}>
                {[{ key: 'easyCount', label: 'Easy' }, { key: 'mediumCount', label: 'Medium' }, { key: 'hardCount', label: 'Hard' }].map(({ key, label }) => (
                  <label key={key}>{label}<input type="number" min={0} max={questionCount} value={settings[key]} onChange={(e) => updateSettings({ [key]: Math.max(0, parseInt(e.target.value, 10) || 0) })} /></label>
                ))}
                <span style={{ fontSize: '0.8rem', color: customTotal !== questionCount ? 'var(--danger)' : '#888', alignSelf: 'end', paddingBottom: '0.6rem' }}>
                  Total: {customTotal} / {questionCount}
                </span>
              </div>
            )}

            <label className="checkbox-label" style={{ marginBottom: '0.75rem' }}>
              <input type="checkbox" checked={settings.includeExplanations} onChange={(e) => updateSettings({ includeExplanations: e.target.checked })} />
              Include explanations
            </label>

            <label style={{ marginBottom: '0.75rem' }}>
              Additional Instructions
              <textarea rows={2} value={settings.additionalInstructions} onChange={(e) => updateSettings({ additionalInstructions: e.target.value })} placeholder="e.g., Focus on lesser-known facts..." />
            </label>

            <div className="btn-row" style={{ marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={handleGenerate} disabled={!splitValid || !categoryValid}>Generate Prompt</button>
            </div>
          </div>
        )}

        {/* Step 4: Output */}
        {step === 4 && output && (
          <div>
            {output.instructions.length > 0 && (
              <fieldset className="form-section" style={{ marginBottom: '1rem' }}>
                <legend>How to Use This Prompt</legend>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.8 }}>
                  {output.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                </ol>
              </fieldset>
            )}

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#555' }}>Your Generated Prompt</span>
                <button className={`btn btn-sm ${copied ? 'btn-primary' : 'btn-outline'}`} onClick={handleCopy}>
                  {copied ? '\u2713 Copied!' : 'Copy'}
                </button>
              </div>
              <pre style={{
                background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '1rem', fontSize: '0.78rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                maxHeight: 300, overflowY: 'auto', lineHeight: 1.5,
              }}>{output.prompt}</pre>
            </div>

            {output.postSteps.length > 0 && (
              <fieldset className="form-section" style={{ marginBottom: '1rem' }}>
                <legend>After You Get Results</legend>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.8 }}>
                  {output.postSteps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </fieldset>
            )}

            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => { onClose(); onImportCSV(); }}>Import CSV</button>
              <button className="btn btn-outline" onClick={() => setStep(3)}>Back to Settings</button>
              <button className="btn btn-outline" onClick={handleReset}>Start Over</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   CSV IMPORT MODAL
   ────────────────────────────────────────────── */

function CSVImportModal({ communityId, onClose, onImported }) {
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target.result);
    reader.readAsText(file);
  };

  const handleParse = () => {
    setParsed(parseCSV(csvText));
    setResult(null);
  };

  const handleImport = async () => {
    if (!parsed || parsed.questions.length === 0) return;
    setImporting(true);
    const rows = parsed.questions.map(q => ({ ...q, community_id: communityId }));
    const { error } = await supabase.from('community_questions').insert(rows);
    if (error) {
      setResult({ type: 'error', text: error.message });
    } else {
      setResult({ type: 'success', text: `Imported ${rows.length} questions` });
      onImported();
    }
    setImporting(false);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Import CSV</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>

        <label style={{ marginBottom: '0.5rem' }}>
          Upload CSV file
          <input type="file" accept=".csv,.txt" ref={fileRef} onChange={handleFile} style={{ marginTop: '0.25rem' }} />
        </label>

        <label style={{ marginTop: '0.75rem' }}>
          Or paste CSV content
          <textarea rows={8} value={csvText} onChange={(e) => { setCsvText(e.target.value); setParsed(null); setResult(null); }} className="mono-input" placeholder="question_text,correct_answer,incorrect_answer_1,..." />
        </label>

        <div className="btn-row" style={{ marginTop: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handleParse} disabled={!csvText.trim()}>Parse CSV</button>
        </div>

        {parsed && (
          <div style={{ marginTop: '1rem' }}>
            {parsed.errors.length > 0 && (
              <div className="inline-message inline-error" style={{ marginBottom: '0.75rem' }}>
                {parsed.errors.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            )}

            {parsed.questions.length > 0 && (
              <>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Preview: {parsed.questions.length} questions parsed
                </p>
                <div style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, marginBottom: '0.75rem' }}>
                  <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--cream)', position: 'sticky', top: 0 }}>
                        <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>#</th>
                        <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Question</th>
                        <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Answer</th>
                        <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Diff</th>
                        <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Cat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.questions.map((q, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{i + 1}</td>
                          <td style={{ padding: '0.35rem 0.5rem', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question_text}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{q.correct_answer}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{q.difficulty}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{q.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
                  {importing ? 'Importing...' : `Import ${parsed.questions.length} Questions`}
                </button>
              </>
            )}
          </div>
        )}

        {result && (
          <div className={`inline-message inline-${result.type}`} style={{ marginTop: '0.75rem' }}>{result.text}</div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   AREA 2 — Quiz Questions (Supabase)
   ────────────────────────────────────────────── */

function QuizQuestions() {
  const [communityId, setCommunityId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_QUESTION);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Generator & CSV modals
  const [showGenerator, setShowGenerator] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Bulk selection
  const [selected, setSelected] = useState(new Set());

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchCommunity = useCallback(async () => {
    const { data, error } = await supabase
      .from('communities').select('id').eq('slug', COMMUNITY_SLUG).single();
    if (error) {
      showMessage('Community not found: ' + error.message, 'error');
    } else {
      setCommunityId(data.id);
    }
    return data?.id;
  }, []);

  const fetchQuestions = useCallback(async (cId) => {
    setLoading(true);
    const id = cId || communityId;
    if (!id) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('community_questions').select('*').eq('community_id', id).order('created_at', { ascending: false });
    if (error) {
      showMessage(error.message, 'error');
    } else {
      setQuestions(data);
    }
    setLoading(false);
  }, [communityId]);

  useEffect(() => {
    (async () => {
      const cId = await fetchCommunity();
      if (cId) await fetchQuestions(cId);
    })();
  }, [fetchCommunity]);

  // Derived data
  const categories = useMemo(() => {
    const cats = [...new Set(questions.map(q => q.category).filter(Boolean))];
    return cats.sort();
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (searchText && !q.question_text.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (filterCategory !== 'all' && q.category !== filterCategory) return false;
      if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
      if (filterStatus !== 'all' && q.status !== filterStatus) return false;
      return true;
    });
  }, [questions, searchText, filterCategory, filterDifficulty, filterStatus]);

  // Edit handlers
  const startEdit = (q) => {
    setEditId(q.id);
    setForm({
      question_text: q.question_text, correct_answer: q.correct_answer,
      incorrect_answers: q.incorrect_answers || ['', '', ''],
      category: q.category || '', difficulty: q.difficulty || 'medium',
      explanation: q.explanation || '',
    });
  };

  const startNew = () => { setEditId('new'); setForm(EMPTY_QUESTION); };
  const cancelEdit = () => { setEditId(null); setForm(EMPTY_QUESTION); };

  const updateIncorrect = (index, value) => {
    const updated = [...form.incorrect_answers];
    updated[index] = value;
    setForm({ ...form, incorrect_answers: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      question_text: form.question_text, correct_answer: form.correct_answer,
      incorrect_answers: form.incorrect_answers.filter(a => a.trim() !== ''),
      category: form.category || null, difficulty: form.difficulty,
      explanation: form.explanation || null, status: 'active',
    };
    if (editId === 'new') {
      const { error } = await supabase.from('community_questions').insert({ ...payload, community_id: communityId });
      if (error) { showMessage(error.message, 'error'); }
      else { showMessage('Question added'); cancelEdit(); fetchQuestions(); }
    } else {
      const { error } = await supabase.from('community_questions').update(payload).eq('id', editId);
      if (error) { showMessage(error.message, 'error'); }
      else { showMessage('Question updated'); cancelEdit(); fetchQuestions(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    const { error } = await supabase.from('community_questions').delete().eq('id', id);
    if (error) { showMessage(error.message, 'error'); }
    else { showMessage('Question deleted'); if (editId === id) cancelEdit(); fetchQuestions(); }
  };

  // Bulk actions
  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(q => q.id)));
    }
  };

  const bulkUpdateStatus = async (status) => {
    if (selected.size === 0) return;
    const ids = [...selected];
    const { error } = await supabase.from('community_questions').update({ status }).in('id', ids);
    if (error) { showMessage(error.message, 'error'); }
    else { showMessage(`${ids.length} question(s) set to ${status}`); setSelected(new Set()); fetchQuestions(); }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected question(s)?`)) return;
    const ids = [...selected];
    const { error } = await supabase.from('community_questions').delete().in('id', ids);
    if (error) { showMessage(error.message, 'error'); }
    else { showMessage(`${ids.length} question(s) deleted`); setSelected(new Set()); if (selected.has(editId)) cancelEdit(); fetchQuestions(); }
  };

  if (loading) return <p>Loading quiz questions...</p>;

  return (
    <>
      {/* Header with action buttons */}
      <div className="section-header">
        <h2>Quiz Questions ({questions.length})</h2>
        <div className="btn-row">
          <button className="btn btn-outline" onClick={() => setShowGenerator(true)}>Generate with AI</button>
          <button className="btn btn-outline" onClick={() => setShowCSVImport(true)}>Import CSV</button>
          <button className="btn btn-primary" onClick={startNew}>+ Add Question</button>
        </div>
      </div>

      {message && (
        <div className={`inline-message inline-${message.type}`}>{message.text}</div>
      )}

      {/* Filters */}
      <fieldset className="form-section" style={{ marginBottom: '1rem' }}>
        <legend>Filters</legend>
        <div className="form-grid">
          <label>
            Search
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search question text..." />
          </label>
          <label>
            Category
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Difficulty
            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>
            Status
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
        {filtered.length !== questions.length && (
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
            Showing {filtered.length} of {questions.length} questions
          </p>
        )}
      </fieldset>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 0.75rem', background: 'var(--blush)', borderRadius: 8, marginBottom: '0.75rem',
          fontSize: '0.85rem',
        }}>
          <strong>{selected.size} selected</strong>
          <button className="btn btn-outline btn-sm" onClick={() => bulkUpdateStatus('active')}>Activate</button>
          <button className="btn btn-outline btn-sm" onClick={() => bulkUpdateStatus('inactive')}>Deactivate</button>
          <button className="btn btn-danger btn-sm" onClick={bulkDelete}>Delete</button>
          <button className="btn btn-outline btn-sm" onClick={() => setSelected(new Set())} style={{ marginLeft: 'auto' }}>Clear</button>
        </div>
      )}

      {/* Edit/New form */}
      {editId && (
        <fieldset className="form-section quiz-form">
          <legend>{editId === 'new' ? 'New Question' : 'Edit Question'}</legend>
          <label>
            Question
            <textarea rows={2} value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} />
          </label>
          <div className="form-grid">
            <label>
              Correct Answer
              <input value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })} placeholder="The right answer" />
            </label>
          </div>
          <div className="form-grid">
            {form.incorrect_answers.map((ans, i) => (
              <label key={i}>
                Wrong Answer {i + 1}
                <input value={ans} onChange={(e) => updateIncorrect(i, e.target.value)} placeholder={`Incorrect option ${i + 1}`} />
              </label>
            ))}
          </div>
          <div className="form-grid">
            <label>
              Category
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Characters, Vengeful Vows" />
            </label>
            <label>
              Difficulty
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </label>
          </div>
          <label>
            Explanation (shown after answering)
            <textarea rows={2} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Optional — explain the answer" />
          </label>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
          </div>
        </fieldset>
      )}

      {/* Question list */}
      <div className="quiz-list">
        {filtered.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', marginBottom: '0.25rem' }}>
            <label className="checkbox-label" style={{ fontSize: '0.8rem', color: '#888' }}>
              <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
              Select all
            </label>
          </div>
        )}
        {filtered.map((q) => (
          <div key={q.id} className="quiz-item">
            <label className="checkbox-label" style={{ alignSelf: 'flex-start', marginTop: '0.2rem', marginRight: '0.5rem' }}>
              <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)} />
            </label>
            <div className="quiz-item-text">
              <strong>{q.question_text}</strong>
              <div className="quiz-options">
                <span className="quiz-option correct">{'\u2713'} {q.correct_answer}</span>
                {(q.incorrect_answers || []).map((ans, i) => (
                  <span key={i} className="quiz-option">{ans}</span>
                ))}
              </div>
              <div className="quiz-meta">
                {q.category && <span className="quiz-tag">{q.category}</span>}
                <span className="quiz-tag">{q.difficulty}</span>
                <span className={`quiz-tag ${q.status === 'active' ? 'tag-active' : 'tag-inactive'}`}>{q.status}</span>
              </div>
            </div>
            <div className="quiz-item-actions">
              <button className="btn btn-outline btn-sm" onClick={() => startEdit(q)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showGenerator && (
        <GeneratorWizard
          communityCategories={categories}
          onClose={() => setShowGenerator(false)}
          onImportCSV={() => setShowCSVImport(true)}
        />
      )}
      {showCSVImport && communityId && (
        <CSVImportModal
          communityId={communityId}
          onClose={() => setShowCSVImport(false)}
          onImported={() => { setShowCSVImport(false); fetchQuestions(); }}
        />
      )}
    </>
  );
}

/* ──────────────────────────────────────────────
   COMBINED — QuizSection
   ────────────────────────────────────────────── */

export default function QuizSection() {
  return (
    <div>
      <h2>Quiz Settings</h2>
      <QuizSettings />
      <hr style={{ margin: '2rem 0', borderColor: 'var(--border)' }} />
      <QuizQuestions />
    </div>
  );
}
