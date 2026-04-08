import { useState } from 'react';
import { setToken } from '../lib/github';

export default function TokenLogin({ onSuccess }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate the token by making a test API call
      const res = await fetch(
        'https://api.github.com/repos/gstreet-ops/ellie-hallaron-website',
        {
          headers: {
            Authorization: `Bearer ${value}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!res.ok) {
        setError('Invalid token — check permissions and try again.');
        setLoading(false);
        return;
      }

      setToken(value);
      onSuccess();
    } catch {
      setError('Connection error — please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Ellie Hallaron</h1>
        <p className="login-subtitle">Admin Panel</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            placeholder="GitHub Personal Access Token"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
