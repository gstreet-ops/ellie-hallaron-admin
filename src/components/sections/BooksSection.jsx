import { useState } from 'react';
import { useData } from '../../contexts/DataContext';

function BookList({ books, onSelect, onAdd, onReorder }) {
  return (
    <div>
      <div className="section-header">
        <h2>Books</h2>
        <button className="btn btn-primary" onClick={onAdd}>+ Add Book</button>
      </div>
      <div className="book-list">
        {books.map((book, i) => (
          <div key={book.slug} className="book-list-item">
            <div className="book-list-reorder">
              <button
                className="btn-icon"
                disabled={i === 0}
                onClick={() => onReorder(i, i - 1)}
                title="Move up"
              >▲</button>
              <button
                className="btn-icon"
                disabled={i === books.length - 1}
                onClick={() => onReorder(i, i + 1)}
                title="Move down"
              >▼</button>
            </div>
            <div className="book-list-cover">
              <img
                src={`https://raw.githubusercontent.com/gstreet-ops/ellie-hallaron-website/main/src${book.cover}`}
                alt={book.cover_alt}
              />
            </div>
            <div className="book-list-info">
              <strong>{book.title}</strong>
              <span className="book-list-number">{book.number}</span>
              <span className={`status-badge status-${book.status}`}>
                {book.status === 'published' ? 'Published' : 'Coming Soon'}
              </span>
            </div>
            <button className="btn btn-outline" onClick={() => onSelect(i)}>
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookEditor({ book, index, onChange, onBack }) {
  const update = (field, value) => {
    onChange(index, { ...book, [field]: value });
  };

  const updatePov = (povIndex, field, value) => {
    const newPov = [...book.blurb_pov];
    newPov[povIndex] = { ...newPov[povIndex], [field]: value };
    update('blurb_pov', newPov);
  };

  const updateVerse = (povIndex, verseIndex, value) => {
    const newPov = [...book.blurb_pov];
    const newVerses = [...newPov[povIndex].verses];
    newVerses[verseIndex] = value;
    newPov[povIndex] = { ...newPov[povIndex], verses: newVerses };
    update('blurb_pov', newPov);
  };

  const addPov = () => {
    update('blurb_pov', [...(book.blurb_pov || []), { character: '', verses: [''] }]);
  };

  const removePov = (povIndex) => {
    update('blurb_pov', book.blurb_pov.filter((_, i) => i !== povIndex));
  };

  const addVerse = (povIndex) => {
    const newPov = [...book.blurb_pov];
    newPov[povIndex] = { ...newPov[povIndex], verses: [...newPov[povIndex].verses, ''] };
    update('blurb_pov', newPov);
  };

  const removeVerse = (povIndex, verseIndex) => {
    const newPov = [...book.blurb_pov];
    newPov[povIndex] = {
      ...newPov[povIndex],
      verses: newPov[povIndex].verses.filter((_, i) => i !== verseIndex),
    };
    update('blurb_pov', newPov);
  };

  const updateCw = (field, value) => {
    const cw = book.content_warning || { label: 'Content Warning', paragraphs: [''] };
    update('content_warning', { ...cw, [field]: value });
  };

  const updateCwParagraph = (i, value) => {
    const cw = book.content_warning || { label: 'Content Warning', paragraphs: [''] };
    const paragraphs = [...cw.paragraphs];
    paragraphs[i] = value;
    update('content_warning', { ...cw, paragraphs });
  };

  const updatePurchaseLink = (i, field, value) => {
    const links = [...(book.purchase_links || [])];
    links[i] = { ...links[i], [field]: value };
    update('purchase_links', links);
  };

  return (
    <div>
      <button className="btn btn-outline back-btn" onClick={onBack}>← Back to Books</button>
      <h2>Edit: {book.title || 'New Book'}</h2>

      <fieldset className="form-section">
        <legend>Basic Info</legend>
        <div className="form-grid">
          <label>
            Title
            <input value={book.title || ''} onChange={(e) => update('title', e.target.value)} />
          </label>
          <label>
            Slug
            <input value={book.slug || ''} onChange={(e) => update('slug', e.target.value)} />
          </label>
          <label>
            Book Number
            <input value={book.number || ''} onChange={(e) => update('number', e.target.value)} placeholder="e.g. Book One" />
          </label>
          <label>
            Couple
            <input value={book.couple || ''} onChange={(e) => update('couple', e.target.value)} placeholder="e.g. Dominic & Katerina" />
          </label>
          <label>
            Status
            <select value={book.status || 'published'} onChange={(e) => update('status', e.target.value)}>
              <option value="published">Published</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </label>
          <label>
            Cover Path
            <input value={book.cover || ''} onChange={(e) => update('cover', e.target.value)} placeholder="/images/covers/book.jpg" />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={book.featured || false} onChange={(e) => update('featured', e.target.checked)} />
            Featured on Homepage
          </label>
          {book.featured && (
            <label>
              Featured Label
              <input value={book.featured_sub || ''} onChange={(e) => update('featured_sub', e.target.value)} placeholder="e.g. Book One — Out Now" />
            </label>
          )}
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Blurb</legend>
        <label>
          Intro Quote
          <textarea rows={3} value={book.blurb_intro || ''} onChange={(e) => update('blurb_intro', e.target.value)} />
        </label>

        {(book.blurb_pov || []).map((pov, pi) => (
          <div key={pi} className="pov-section">
            <div className="pov-header">
              <label>
                Character Name
                <input value={pov.character} onChange={(e) => updatePov(pi, 'character', e.target.value)} />
              </label>
              <button className="btn btn-danger btn-sm" onClick={() => removePov(pi)}>Remove POV</button>
            </div>
            {pov.verses.map((verse, vi) => (
              <div key={vi} className="verse-row">
                <textarea
                  rows={4}
                  value={verse}
                  onChange={(e) => updateVerse(pi, vi, e.target.value)}
                  placeholder="One verse per box. Use line breaks within a verse for <br> tags."
                />
                <button className="btn-icon btn-danger" onClick={() => removeVerse(pi, vi)} title="Remove verse">✕</button>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" onClick={() => addVerse(pi)}>+ Add Verse</button>
          </div>
        ))}
        <button className="btn btn-outline" onClick={addPov}>+ Add POV</button>
      </fieldset>

      <fieldset className="form-section">
        <legend>Content Warning</legend>
        {book.content_warning ? (
          <>
            <label>
              Label
              <input value={book.content_warning.label || ''} onChange={(e) => updateCw('label', e.target.value)} />
            </label>
            {(book.content_warning.paragraphs || []).map((p, i) => (
              <div key={i} className="verse-row">
                <textarea rows={3} value={p} onChange={(e) => updateCwParagraph(i, e.target.value)} />
                <button
                  className="btn-icon btn-danger"
                  onClick={() => {
                    const paragraphs = book.content_warning.paragraphs.filter((_, j) => j !== i);
                    updateCw('paragraphs', paragraphs);
                  }}
                  title="Remove paragraph"
                >✕</button>
              </div>
            ))}
            <div className="btn-row">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => updateCw('paragraphs', [...(book.content_warning.paragraphs || []), ''])}
              >+ Add Paragraph</button>
              <button className="btn btn-danger btn-sm" onClick={() => update('content_warning', null)}>Remove Warning</button>
            </div>
          </>
        ) : (
          <button className="btn btn-outline" onClick={() => update('content_warning', { label: 'Content Warning', paragraphs: [''] })}>
            + Add Content Warning
          </button>
        )}
      </fieldset>

      <fieldset className="form-section">
        <legend>Purchase Links</legend>
        {(book.purchase_links || []).map((link, i) => (
          <div key={i} className="form-grid purchase-row">
            <label>
              Label
              <input value={link.label || ''} onChange={(e) => updatePurchaseLink(i, 'label', e.target.value)} />
            </label>
            <label>
              URL
              <input value={link.url || ''} onChange={(e) => updatePurchaseLink(i, 'url', e.target.value)} />
            </label>
            <label>
              Style
              <select value={link.style || 'outline'} onChange={(e) => updatePurchaseLink(i, 'style', e.target.value)}>
                <option value="primary">Primary</option>
                <option value="outline">Outline</option>
              </select>
            </label>
            <button
              className="btn-icon btn-danger"
              onClick={() => update('purchase_links', book.purchase_links.filter((_, j) => j !== i))}
              title="Remove link"
            >✕</button>
          </div>
        ))}
        <button
          className="btn btn-outline btn-sm"
          onClick={() => update('purchase_links', [...(book.purchase_links || []), { label: '', url: '#', style: 'outline' }])}
        >+ Add Link</button>
      </fieldset>
    </div>
  );
}

export default function BooksSection() {
  const { getData, updateFile } = useData();
  const [editIndex, setEditIndex] = useState(null);

  const books = getData('books') || [];

  const handleChange = (index, updatedBook) => {
    const updated = [...books];
    updated[index] = updatedBook;
    updateFile('books', updated);
  };

  const handleAdd = () => {
    const newBook = {
      slug: '',
      title: '',
      series: 'The Syndicate Series',
      number: '',
      couple: '',
      cover: '',
      cover_alt: '',
      status: 'coming_soon',
      featured: false,
      featured_sub: '',
      meta_description: '',
      blurb_intro: '',
      blurb_pov: [],
      content_warning: null,
      purchase_links: [],
    };
    updateFile('books', [...books, newBook]);
    setEditIndex(books.length);
  };

  const handleReorder = (from, to) => {
    const updated = [...books];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    updateFile('books', updated);
  };

  if (editIndex !== null && books[editIndex]) {
    return (
      <BookEditor
        book={books[editIndex]}
        index={editIndex}
        onChange={handleChange}
        onBack={() => setEditIndex(null)}
      />
    );
  }

  return (
    <BookList
      books={books}
      onSelect={setEditIndex}
      onAdd={handleAdd}
      onReorder={handleReorder}
    />
  );
}
