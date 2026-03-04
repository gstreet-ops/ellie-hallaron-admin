import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { supabase } from '../../lib/supabase';

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

function ColorInput({ label, value, onChange }) {
  return (
    <label>
      {label}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
        <span
          style={{
            display: 'inline-block',
            width: 24,
            height: 24,
            background: value || '#ccc',
            border: '1px solid #ccc',
            borderRadius: 4,
            marginLeft: 8,
            verticalAlign: 'middle',
            flexShrink: 0,
          }}
        />
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
          <input
            value={quiz.heading || ''}
            onChange={(e) => update('heading', e.target.value)}
          />
        </label>
        <label style={{ marginTop: '0.75rem' }}>
          Description (supports HTML)
          <textarea
            rows={3}
            value={quiz.description || ''}
            onChange={(e) => update('description', e.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="form-section">
        <legend>Quiz Appearance</legend>
        <div className="form-grid">
          {COLOR_FIELDS.map(({ key, label }) => (
            <ColorInput
              key={key}
              label={label}
              value={quiz.theme?.[key] || ''}
              onChange={(v) => update(`theme.${key}`, v)}
            />
          ))}
        </div>
        <label style={{ marginTop: '0.75rem' }}>
          Font Family
          <input
            value={quiz.theme?.font || ''}
            onChange={(e) => update('theme.font', e.target.value)}
            placeholder="Google Fonts name, e.g. Lato"
          />
        </label>
      </fieldset>

      <fieldset className="form-section">
        <legend>Quiz Behavior</legend>
        <div className="form-grid">
          <label>
            Questions per Round
            <select
              value={quiz.behavior?.count ?? 10}
              onChange={(e) => update('behavior.count', Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </label>
          <label>
            Difficulty
            <select
              value={quiz.behavior?.difficulty || 'mixed'}
              onChange={(e) => update('behavior.difficulty', e.target.value)}
            >
              <option value="mixed">Mixed</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>
            Timer in Seconds
            <input
              type="number"
              min={0}
              value={quiz.behavior?.timer ?? 0}
              onChange={(e) => update('behavior.timer', Number(e.target.value))}
              placeholder="0 = no timer"
            />
          </label>
          <label>
            Category Filter
            <input
              value={quiz.behavior?.category || ''}
              onChange={(e) => update('behavior.category', e.target.value)}
              placeholder="all = show all"
            />
          </label>
        </div>
      </fieldset>
    </>
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

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchCommunity = useCallback(async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', COMMUNITY_SLUG)
      .single();
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
      .from('community_questions')
      .select('*')
      .eq('community_id', id)
      .order('created_at', { ascending: false });
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

  const startEdit = (q) => {
    setEditId(q.id);
    setForm({
      question_text: q.question_text,
      correct_answer: q.correct_answer,
      incorrect_answers: q.incorrect_answers || ['', '', ''],
      category: q.category || '',
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || '',
    });
  };

  const startNew = () => {
    setEditId('new');
    setForm(EMPTY_QUESTION);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(EMPTY_QUESTION);
  };

  const updateIncorrect = (index, value) => {
    const updated = [...form.incorrect_answers];
    updated[index] = value;
    setForm({ ...form, incorrect_answers: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      question_text: form.question_text,
      correct_answer: form.correct_answer,
      incorrect_answers: form.incorrect_answers.filter(a => a.trim() !== ''),
      category: form.category || null,
      difficulty: form.difficulty,
      explanation: form.explanation || null,
      status: 'active',
    };

    if (editId === 'new') {
      const { error } = await supabase.from('community_questions').insert({
        ...payload,
        community_id: communityId,
      });
      if (error) {
        showMessage(error.message, 'error');
      } else {
        showMessage('Question added');
        cancelEdit();
        fetchQuestions();
      }
    } else {
      const { error } = await supabase
        .from('community_questions')
        .update(payload)
        .eq('id', editId);
      if (error) {
        showMessage(error.message, 'error');
      } else {
        showMessage('Question updated');
        cancelEdit();
        fetchQuestions();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    const { error } = await supabase.from('community_questions').delete().eq('id', id);
    if (error) {
      showMessage(error.message, 'error');
    } else {
      showMessage('Question deleted');
      if (editId === id) cancelEdit();
      fetchQuestions();
    }
  };

  if (loading) return <p>Loading quiz questions...</p>;

  return (
    <>
      <div className="section-header">
        <h2>Quiz Questions ({questions.length})</h2>
        <button className="btn btn-primary" onClick={startNew}>+ Add Question</button>
      </div>

      {message && (
        <div className={`inline-message inline-${message.type}`}>{message.text}</div>
      )}

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
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>
          <label>
            Explanation (shown after answering)
            <textarea rows={2} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Optional — explain the answer" />
          </label>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
          </div>
        </fieldset>
      )}

      <div className="quiz-list">
        {questions.map((q) => (
          <div key={q.id} className="quiz-item">
            <div className="quiz-item-text">
              <strong>{q.question_text}</strong>
              <div className="quiz-options">
                <span className="quiz-option correct">✓ {q.correct_answer}</span>
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
