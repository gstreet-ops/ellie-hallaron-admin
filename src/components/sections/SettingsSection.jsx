import { useData } from '../../contexts/DataContext';

export default function SettingsSection() {
  const { getData, updateFile } = useData();
  const site = getData('site') || {};
  const hero = getData('hero') || {};
  const newsletter = getData('newsletter') || {};

  const updateSite = (field, value) => {
    updateFile('site', { ...site, [field]: value });
  };

  const updateHero = (field, value) => {
    updateFile('hero', { ...hero, [field]: value });
  };

  const updateNewsletter = (field, value) => {
    updateFile('newsletter', { ...newsletter, [field]: value });
  };

  return (
    <div>
      <h2>Site Settings</h2>

      <fieldset className="form-section">
        <legend>Site Info</legend>
        <div className="form-grid">
          <label>
            Title
            <input value={site.title || ''} onChange={(e) => updateSite('title', e.target.value)} />
          </label>
          <label>
            Tagline
            <input value={site.tagline || ''} onChange={(e) => updateSite('tagline', e.target.value)} />
          </label>
          <label>
            Contact Email
            <input type="email" value={site.contact_email || ''} onChange={(e) => updateSite('contact_email', e.target.value)} />
          </label>
          <label>
            Copyright Year
            <input value={site.copyright_year || ''} onChange={(e) => updateSite('copyright_year', e.target.value)} />
          </label>
        </div>
        <label>
          Description
          <textarea rows={3} value={site.description || ''} onChange={(e) => updateSite('description', e.target.value)} />
        </label>
      </fieldset>

      <fieldset className="form-section">
        <legend>Hero Section</legend>
        <div className="form-grid">
          <label>
            Logo Path
            <input value={hero.logo || ''} onChange={(e) => updateHero('logo', e.target.value)} />
          </label>
          <label>
            Logo Alt Text
            <input value={hero.logo_alt || ''} onChange={(e) => updateHero('logo_alt', e.target.value)} />
          </label>
          <label>
            Tagline
            <input value={hero.tagline || ''} onChange={(e) => updateHero('tagline', e.target.value)} />
          </label>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Newsletter</legend>
        <div className="form-grid">
          <label>
            Heading
            <input value={newsletter.heading || ''} onChange={(e) => updateNewsletter('heading', e.target.value)} />
          </label>
          <label>
            Section Label
            <input value={newsletter.label || ''} onChange={(e) => updateNewsletter('label', e.target.value)} />
          </label>
          <label>
            CTA Button Text
            <input value={newsletter.cta_label || ''} onChange={(e) => updateNewsletter('cta_label', e.target.value)} />
          </label>
        </div>
        <label>
          Description
          <textarea rows={3} value={newsletter.description || ''} onChange={(e) => updateNewsletter('description', e.target.value)} />
        </label>
        <label>
          Note (below form)
          <input value={newsletter.note || ''} onChange={(e) => updateNewsletter('note', e.target.value)} />
        </label>
      </fieldset>
    </div>
  );
}
