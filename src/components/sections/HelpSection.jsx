import { useState } from 'react';

const CSV_EXAMPLE = `question_text,correct_answer,incorrect_answer_1,incorrect_answer_2,incorrect_answer_3,category,difficulty,explanation
"What color is the sky?","Blue","Green","Red","Yellow","Science","easy","The sky appears blue due to Rayleigh scattering of sunlight."
"Who wrote Romeo and Juliet?","Shakespeare","Dickens","Austen","Hemingway","Literature","medium","William Shakespeare wrote the play around 1595."`;

const SECTIONS = [
  {
    title: 'Getting Started',
    content: (
      <>
        <h4>What does this admin panel do?</h4>
        <p>
          This admin panel lets you manage all the content on <strong>elliehallaron.com</strong> — your books, bio, social links, site settings, and trivia quiz — all from one place, without touching any code.
        </p>

        <h4>How saving works</h4>
        <ol>
          <li>Make your changes in any section.</li>
          <li>Click the <strong>Save</strong> button (pink button, bottom-right corner).</li>
          <li>Your changes are saved to GitHub, which automatically rebuilds the website.</li>
          <li>The live site updates in about <strong>60 seconds</strong>.</li>
        </ol>
        <p className="help-note">
          The Save button only appears when you have unsaved changes. If you don't see it, your changes are already saved.
        </p>

        <h4>The preview pane</h4>
        <p>
          Click <strong>"Preview Site"</strong> at the top of any section to open a live preview of your website on the right side of the screen. The preview automatically scrolls to the page that matches the section you're editing (e.g., editing Books shows the Books page). Use the <strong>Refresh</strong> button to reload the preview after saving.
        </p>
      </>
    ),
  },
  {
    title: 'Books',
    content: (
      <>
        <h4>Editing book details</h4>
        <p>
          Click on any book in the list to open its editor. You can change the <strong>title</strong>, <strong>subtitle</strong>, <strong>blurb</strong> (the description shown on the website), and <strong>content warning</strong> text.
        </p>

        <h4>Purchase links</h4>
        <p>
          Each book can have multiple purchase links (Amazon, Kindle Unlimited, Barnes & Noble, etc.). To add a new link, click <strong>"+ Add Link"</strong> inside the book editor. Enter the retailer name and the full URL. To remove a link, click the trash icon next to it.
        </p>

        <h4>Book cover images</h4>
        <p>
          To change a cover image, update the <strong>Cover URL</strong> field with the new image URL. The image should be hosted online (e.g., on your website's images folder or an image hosting service).
        </p>

        <h4>Book ordering and series info</h4>
        <p>
          Books are displayed in the order they appear in the list. Use the <strong>up/down arrows</strong> to reorder them. The series number field controls the "#1 in the series" label shown on the website.
        </p>
      </>
    ),
  },
  {
    title: 'Bio / About',
    content: (
      <>
        <h4>Editing your bio</h4>
        <p>
          The bio section has two versions of your author bio:
        </p>
        <ul>
          <li><strong>Short bio</strong> — appears on the homepage as a teaser.</li>
          <li><strong>Full bio</strong> — appears on the About page. This is broken into paragraphs; each text box is one paragraph.</li>
        </ul>
        <p>
          To add a new paragraph to your full bio, click <strong>"+ Add Paragraph"</strong>. To remove one, click the trash icon next to it.
        </p>

        <h4>Author photo</h4>
        <p>
          Update the <strong>Photo URL</strong> field with a link to your author photo. The photo appears on both the homepage and the About page.
        </p>
      </>
    ),
  },
  {
    title: 'Social Links',
    content: (
      <>
        <h4>Adding and removing platforms</h4>
        <p>
          Click <strong>"+ Add Link"</strong> to add a new social platform. A dropdown menu lets you pick from popular platforms like TikTok, Instagram, Goodreads, Amazon, Facebook, YouTube, and more. The platform name and icon are filled in automatically when you select one.
        </p>
        <p>
          To remove a platform, click the <strong>trash icon</strong> on that card.
        </p>

        <h4>URL and handle</h4>
        <ul>
          <li><strong>URL</strong> — the full link to your profile (e.g., https://www.instagram.com/yourhandle).</li>
          <li><strong>Handle</strong> — how it displays on the website (e.g., @yourhandle).</li>
        </ul>

        <h4>Custom platforms</h4>
        <p>
          If your platform isn't in the dropdown, select <strong>"Custom"</strong>. This lets you type any platform name and paste a custom SVG icon path. You can find SVG icon paths on sites like <em>simpleicons.org</em>.
        </p>
      </>
    ),
  },
  {
    title: 'Site Settings',
    content: (
      <>
        <h4>Hero section</h4>
        <p>
          The hero is the large banner area at the top of the homepage. You can edit:
        </p>
        <ul>
          <li><strong>Headline</strong> — the main text visitors see first.</li>
          <li><strong>Subtitle</strong> — smaller text below the headline.</li>
          <li><strong>CTA button</strong> — the call-to-action button text and where it links to.</li>
        </ul>

        <h4>Site metadata</h4>
        <p>
          The <strong>site title</strong> and <strong>description</strong> affect what shows up in browser tabs and search engine results. Keep the title short and the description under 160 characters.
        </p>

        <h4>Newsletter section</h4>
        <p>
          Edit the text and heading that appear in the newsletter signup area on the Connect page.
        </p>

        <h4>Navigation labels</h4>
        <p>
          You can rename the navigation links that appear in the site header. For example, change "About" to "About Ellie" or "Connect" to "Contact."
        </p>
      </>
    ),
  },
  {
    title: 'Quiz',
    content: (
      <>
        <h4>Manual questions</h4>
        <p>
          Click <strong>"+ Add Question"</strong> to create a new trivia question. Fill in the question text, the correct answer, and three incorrect answers. Set the category, difficulty (easy, medium, or hard), and optionally add an explanation. Click <strong>Save</strong> to add it.
        </p>
        <p>
          To edit an existing question, click the <strong>pencil icon</strong>. To delete one, click the <strong>trash icon</strong>.
        </p>

        <h4>AI question generator</h4>
        <p>
          Click <strong>"Generate with AI"</strong> to open the question generator wizard. It walks you through four steps:
        </p>
        <ol>
          <li><strong>Source</strong> — Choose where the questions come from: web search, a website URL, a YouTube video, pasted text, a spreadsheet, study notes, or social media posts.</li>
          <li><strong>Details</strong> — Enter the specific topic, URL, or paste your content depending on the source you chose.</li>
          <li><strong>Settings</strong> — Pick a category, how many questions to generate, difficulty distribution (equal split or custom), and whether to include explanations.</li>
          <li><strong>Generate</strong> — The wizard builds an AI prompt. Click <strong>"Copy Prompt"</strong>, paste it into an AI tool like ChatGPT or Claude, and the AI will generate questions in CSV format. Copy that CSV output.</li>
        </ol>
        <p className="help-note">
          The generator does not create questions directly — it builds a prompt you paste into an AI tool, which does the actual generation.
        </p>

        <h4>CSV import</h4>
        <p>
          Click <strong>"Import CSV"</strong> to bulk-import questions. You can either upload a <code>.csv</code> file or paste CSV text directly. The expected format is:
        </p>
        <pre className="help-code">{CSV_EXAMPLE}</pre>
        <p>
          Required columns: <code>question_text</code>, <code>correct_answer</code>. Optional columns: <code>incorrect_answer_1</code>, <code>incorrect_answer_2</code>, <code>incorrect_answer_3</code>, <code>category</code>, <code>difficulty</code>, <code>explanation</code>.
        </p>
        <p>
          After pasting or uploading, you'll see a preview table. Review the questions, then click <strong>"Import All"</strong> to add them to your quiz.
        </p>

        <h4>Filtering questions</h4>
        <p>
          Use the filter controls above the question list to narrow down what you see:
        </p>
        <ul>
          <li><strong>Search</strong> — type any text to search question content.</li>
          <li><strong>Category</strong> — filter by question category.</li>
          <li><strong>Difficulty</strong> — show only easy, medium, or hard questions.</li>
          <li><strong>Status</strong> — show only active or inactive questions.</li>
        </ul>

        <h4>Bulk actions</h4>
        <p>
          Use the checkboxes on the left of each question to select multiple questions at once. You can also use <strong>"Select All"</strong> to check every visible question. Then use the bulk action buttons to:
        </p>
        <ul>
          <li><strong>Activate</strong> — make selected questions live on the quiz.</li>
          <li><strong>Deactivate</strong> — hide selected questions without deleting them.</li>
          <li><strong>Delete</strong> — permanently remove selected questions.</li>
        </ul>

        <h4>Quiz appearance</h4>
        <p>
          In the <strong>Quiz Settings</strong> area at the top, you can customize how the quiz looks and behaves on your website:
        </p>
        <ul>
          <li><strong>Colors</strong> — background, surface, primary (buttons), accent, and text colors.</li>
          <li><strong>Font</strong> — the font used in the quiz widget.</li>
          <li><strong>Question count</strong> — how many questions appear per quiz session.</li>
          <li><strong>Difficulty</strong> — "mixed" for a variety, or lock to one difficulty level.</li>
          <li><strong>Timer</strong> — set a per-question timer in seconds, or 0 for no timer.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Troubleshooting',
    content: (
      <>
        <div className="help-faq">
          <h4>"My changes aren't showing up on the website"</h4>
          <p>
            After clicking Save, the website takes about <strong>60 seconds</strong> to rebuild and update. Wait a minute, then refresh the page. If changes still don't appear after a few minutes, try clearing your browser cache or opening the site in an incognito window.
          </p>
        </div>

        <div className="help-faq">
          <h4>"I see an error when saving"</h4>
          <p>
            Check your internet connection and try again. If the error persists, try refreshing the admin panel page. If it still doesn't work, contact Brian for help.
          </p>
        </div>

        <div className="help-faq">
          <h4>"The quiz isn't loading on my website"</h4>
          <p>
            Make sure you have questions in the quiz section and that they are set to <strong>"active"</strong> status. The quiz needs at least one active question to display. Check the Quiz section in this admin panel to verify.
          </p>
        </div>

        <div className="help-faq">
          <h4>"I forgot my password"</h4>
          <p>
            Contact Brian for a password reset. He can send you a reset link or set up new credentials for you.
          </p>
        </div>
      </>
    ),
  },
];

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`help-accordion ${open ? 'open' : ''}`}>
      <button className="help-accordion-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="help-accordion-arrow">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="help-accordion-body">{children}</div>}
    </div>
  );
}

export default function HelpSection() {
  return (
    <div>
      <div className="section-header">
        <h2>Help & Reference Guide</h2>
      </div>
      <p style={{ marginBottom: '1.5rem', color: '#666' }}>
        Everything you need to know about managing your website. Click any section below to expand it.
      </p>
      {SECTIONS.map((section) => (
        <Accordion key={section.title} title={section.title} defaultOpen={section.title === 'Getting Started'}>
          {section.content}
        </Accordion>
      ))}
    </div>
  );
}
