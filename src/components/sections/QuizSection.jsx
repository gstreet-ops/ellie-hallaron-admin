import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const COMMUNITY = 'ellie-hallaron';

const EMPTY_QUESTION = {
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'a',
  category: '',
  difficulty: 'medium',
};

export default function QuizSection() {
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

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('community_slug', COMMUNITY)
      .order('created_at', { ascending: false });
    if (error) {
      showMessage(error.message, 'error');
    } else {
      setQuestions(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const startEdit = (q) => {
    setEditId(q.id);
    setForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      category: q.category || '',
      difficulty: q.difficulty || 'medium',
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

  const handleSave = async () => {
    setSaving(true);
    if (editId === 'new') {
      const { error } = await supabase.from('questions').insert({
        ...form,
        community_slug: COMMUNITY,
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
        .from('questions')
        .update(form)
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
    const { error } = await supabase.from('questions').delete().eq('id', id);
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
    <div>
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
              Option A
              <input value={form.option_a} onChange={(e) => setForm({ ...form, option_a: e.target.value })} />
            </label>
            <label>
              Option B
              <input value={form.option_b} onChange={(e) => setForm({ ...form, option_b: e.target.value })} />
            </label>
            <label>
              Option C
              <input value={form.option_c} onChange={(e) => setForm({ ...form, option_c: e.target.value })} />
            </label>
            <label>
              Option D
              <input value={form.option_d} onChange={(e) => setForm({ ...form, option_d: e.target.value })} />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Correct Answer
              <select value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}>
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
              </select>
            </label>
            <label>
              Category
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Characters" />
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
                {['a', 'b', 'c', 'd'].map((opt) => (
                  <span
                    key={opt}
                    className={`quiz-option ${q.correct_answer === opt ? 'correct' : ''}`}
                  >
                    {opt.toUpperCase()}: {q[`option_${opt}`]}
                  </span>
                ))}
              </div>
              <div className="quiz-meta">
                {q.category && <span className="quiz-tag">{q.category}</span>}
                <span className="quiz-tag">{q.difficulty}</span>
              </div>
            </div>
            <div className="quiz-item-actions">
              <button className="btn btn-outline btn-sm" onClick={() => startEdit(q)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
