const REPO = 'gstreet-ops/ellie-hallaron-website';
const API_BASE = `https://api.github.com/repos/${REPO}/contents`;
const TOKEN_KEY = 'eh_admin_token';

let _token = localStorage.getItem(TOKEN_KEY) || '';

export function getToken() {
  return _token;
}

export function setToken(token) {
  _token = token;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  _token = '';
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken() {
  return !!_token;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${_token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

export async function fetchFile(path) {
  const res = await fetch(`${API_BASE}/${path}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  const data = await res.json();
  const content = decodeBase64(data.content);
  return { content, sha: data.sha };
}

export async function saveFile(path, content, sha, message) {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      message,
      content: encodeBase64(content),
      sha,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to save ${path}: ${res.status}`);
  }
  const data = await res.json();
  return { sha: data.content.sha };
}

const DATA_FILES = [
  'src/_data/site.json',
  'src/_data/nav.json',
  'src/_data/hero.json',
  'src/_data/series.json',
  'src/_data/books.json',
  'src/_data/bio.json',
  'src/_data/social.json',
  'src/_data/quiz.json',
  'src/_data/newsletter.json',
  'src/_data/pagesMeta.json',
];

export async function fetchAllData() {
  const results = {};
  await Promise.all(
    DATA_FILES.map(async (filePath) => {
      const { content, sha } = await fetchFile(filePath);
      const key = filePath.replace('src/_data/', '').replace('.json', '');
      results[key] = { data: JSON.parse(content), sha, path: filePath };
    })
  );
  return results;
}

export async function saveChangedFiles(files) {
  const results = [];
  for (const file of files) {
    const content = JSON.stringify(file.data, null, 2) + '\n';
    const { sha } = await saveFile(
      file.path,
      content,
      file.sha,
      `admin: update ${file.path.replace('src/_data/', '')}`
    );
    results.push({ path: file.path, sha });
  }
  return results;
}

function decodeBase64(encoded) {
  const cleaned = encoded.replace(/\n/g, '');
  const bytes = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}
