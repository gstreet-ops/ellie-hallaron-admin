/**
 * PromptBuilder.js — Pure utility, no UI
 * Builds AI prompt strings for trivia question generation.
 */

export const SOURCES = [
  { id: 'web-search', icon: '\u{1F310}', label: 'Web Search', description: 'Generate from any topic using AI web search', mode: 'ai-accessible' },
  { id: 'website', icon: '\u{1F517}', label: 'Website URL', description: 'Generate from a specific webpage', mode: 'ai-accessible' },
  { id: 'youtube', icon: '\u{1F3A5}', label: 'YouTube Video', description: 'Generate from video transcripts', mode: 'ai-accessible' },
  { id: 'document', icon: '\u{1F4C4}', label: 'Document / Text', description: 'Generate from pasted or uploaded document content', mode: 'paste-assisted' },
  { id: 'data-file', icon: '\u{1F4CA}', label: 'Spreadsheet / CSV', description: 'Transform existing data into questions', mode: 'paste-assisted' },
  { id: 'study-notes', icon: '\u{1F4DD}', label: 'Study Notes', description: 'Create questions from notes or outlines', mode: 'paste-assisted' },
  { id: 'social-media', icon: '\u{1F4F1}', label: 'Social Media', description: 'Generate from social media posts', mode: 'paste-assisted' },
];

export function getSourceById(id) {
  return SOURCES.find(s => s.id === id) || null;
}

export function computeEqualSplit(count) {
  const base = Math.floor(count / 3);
  let remainder = count - base * 3;
  let easy = base, medium = base, hard = base;
  if (remainder > 0) { easy++; remainder--; }
  if (remainder > 0) { medium++; }
  return { easy, medium, hard };
}

export function buildPrompt(source, sourceInput, settings) {
  const src = getSourceById(source);
  if (!src) return { prompt: '', instructions: [], postSteps: [], sourceMode: 'ai-accessible' };

  const {
    category = 'General Knowledge',
    customCategory = '',
    questionCount = 20,
    difficultySplit = 'equal',
    easyCount = 0,
    mediumCount = 0,
    hardCount = 0,
    includeExplanations = true,
    additionalInstructions = '',
  } = settings;

  const count = questionCount;
  const categoryLabel = category === 'Custom' ? customCategory : category;

  let easy, medium, hard;
  if (difficultySplit === 'custom') {
    easy = easyCount;
    medium = mediumCount;
    hard = hardCount;
  } else {
    const split = computeEqualSplit(count);
    easy = split.easy;
    medium = split.medium;
    hard = split.hard;
  }

  const lines = [];

  const hasPastedContent = src.mode === 'paste-assisted' && sourceInput.content && sourceInput.content.trim();
  if (hasPastedContent) {
    lines.push('--- BEGIN CONTENT ---');
    lines.push(sourceInput.content.trim());
    lines.push('--- END CONTENT ---');
    lines.push('');
  }

  switch (source) {
    case 'web-search':
      lines.push(`Search the web thoroughly on the topic of "${sourceInput.topic || ''}"${sourceInput.focusArea ? ` and focus specifically on: ${sourceInput.focusArea}` : ''}. Generate exactly ${count} multiple-choice trivia questions.`);
      break;
    case 'website':
      lines.push(`Go to this webpage and read its content: ${sourceInput.url || ''}`);
      if (sourceInput.focusArea) lines.push(`Focus specifically on: ${sourceInput.focusArea}`);
      lines.push(`Using the information from that page, generate exactly ${count} multiple-choice trivia questions.`);
      break;
    case 'youtube':
      lines.push(`Access this YouTube video and get its transcript: ${sourceInput.url || ''}`);
      if (sourceInput.focusArea) lines.push(`Focus specifically on: ${sourceInput.focusArea}`);
      lines.push(`Using the content from the video, generate exactly ${count} multiple-choice trivia questions.`);
      break;
    case 'document':
      lines.push(`Using the document content I have provided above, generate exactly ${count} multiple-choice trivia questions.`);
      if (sourceInput.contextHint) lines.push(`Context: This document is about ${sourceInput.contextHint}.`);
      break;
    case 'data-file':
      lines.push(`Using the spreadsheet/CSV data I have provided above${sourceInput.dataDescription ? ` (which contains: ${sourceInput.dataDescription})` : ''}, transform this information into exactly ${count} multiple-choice trivia questions.`);
      break;
    case 'study-notes':
      lines.push(`Using the study notes/outline I have provided above${sourceInput.contextHint ? ` for ${sourceInput.contextHint}` : ''}, create exactly ${count} multiple-choice trivia questions.`);
      break;
    case 'social-media':
      lines.push(`Using the ${sourceInput.platform || 'social media'} posts I have provided above from ${sourceInput.accountName || 'the account'}, generate exactly ${count} multiple-choice trivia questions.`);
      break;
    default:
      break;
  }

  lines.push('');
  lines.push(`Difficulty distribution: ${easy} easy, ${medium} medium, ${hard} hard.`);
  lines.push('');
  lines.push(`Category for all questions: "${categoryLabel}".`);
  lines.push('');

  if (additionalInstructions && additionalInstructions.trim()) {
    lines.push(`Additional requirements: ${additionalInstructions.trim()}`);
    lines.push('');
  }

  const csvHeaders = `question_text,correct_answer,incorrect_answer_1,incorrect_answer_2,incorrect_answer_3,category,difficulty${includeExplanations ? ',explanation' : ''}`;
  lines.push('**Output format:**');
  lines.push(`Generate the results as a CSV with these exact headers:`);
  lines.push(csvHeaders);
  lines.push('');
  lines.push('Rules for the CSV:');
  lines.push('- Wrap ALL field values in double quotes');
  lines.push('- Escape any internal double quotes with two double quotes ("")');
  lines.push('- One question per line');
  lines.push('- No blank lines between questions');
  lines.push('- Output ONLY the raw CSV data (header row + data rows) inside a single code block');
  if (includeExplanations) {
    lines.push('- The explanation should be 1-2 sentences explaining why the correct answer is right');
  }
  lines.push('');

  lines.push('**Quality requirements:**');
  lines.push('- Questions must be factually accurate and unambiguous');
  lines.push('- Each question must have exactly ONE clearly correct answer');
  lines.push('- All three wrong answers must be plausible');
  lines.push('- No "all of the above" or "none of the above" answers');
  lines.push('- Cover diverse subtopics within the source material');

  const instructions = [];
  if (src.mode === 'ai-accessible') {
    instructions.push('Open your preferred AI chat tool (Claude, ChatGPT, Gemini, etc.)');
    instructions.push('Make sure web search is enabled if available');
    instructions.push('Paste the prompt below into the chat');
    instructions.push('Copy the CSV output from the response');
  } else if (hasPastedContent) {
    instructions.push('Open your preferred AI chat tool');
    instructions.push('Paste the prompt below \u2014 your content is already included');
    instructions.push('Copy the CSV output from the response');
  } else {
    instructions.push('Open your preferred AI chat tool');
    instructions.push('Upload your file or paste your content first');
    instructions.push('Then paste the prompt below');
    instructions.push('Copy the CSV output from the response');
  }

  const postSteps = [
    'Download or copy the CSV from the AI response',
    'Click "Import CSV" below to upload it',
    'Review imported questions and adjust as needed',
  ];

  return { prompt: lines.join('\n'), instructions, postSteps, sourceMode: src.mode };
}

/**
 * Parse CSV text into question objects.
 * Handles quoted fields with escaped double-quotes.
 */
export function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { questions: [], errors: ['CSV must have a header row and at least one data row'] };

  const header = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

  const colMap = {
    question: header.indexOf('question_text'),
    correct: header.indexOf('correct_answer'),
    inc1: header.indexOf('incorrect_answer_1'),
    inc2: header.indexOf('incorrect_answer_2'),
    inc3: header.indexOf('incorrect_answer_3'),
    category: header.indexOf('category'),
    difficulty: header.indexOf('difficulty'),
    explanation: header.indexOf('explanation'),
  };

  if (colMap.question === -1 || colMap.correct === -1) {
    return { questions: [], errors: ['CSV must have question_text and correct_answer columns'] };
  }

  const questions = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = parseCSVLine(lines[i]);
    const q = cols[colMap.question]?.trim();
    const correct = cols[colMap.correct]?.trim();
    if (!q || !correct) {
      errors.push(`Row ${i + 1}: missing question or correct answer`);
      continue;
    }
    const incorrect = [
      cols[colMap.inc1]?.trim(),
      cols[colMap.inc2]?.trim(),
      cols[colMap.inc3]?.trim(),
    ].filter(Boolean);

    questions.push({
      question_text: q,
      correct_answer: correct,
      incorrect_answers: incorrect,
      category: cols[colMap.category]?.trim() || null,
      difficulty: cols[colMap.difficulty]?.trim() || 'medium',
      explanation: colMap.explanation !== -1 ? (cols[colMap.explanation]?.trim() || null) : null,
      status: 'active',
    });
  }

  return { questions, errors };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}
