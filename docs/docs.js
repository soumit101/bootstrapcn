const sidebar = document.querySelector('#docs-sidebar');
const mobile = matchMedia('(width < 760px)');
const syncSidebar = () => { sidebar.hidden = mobile.matches; document.querySelector('[data-sc-collapse-target="docs-sidebar"]').setAttribute('aria-expanded', String(!sidebar.hidden)); };
syncSidebar(); mobile.addEventListener('change', syncSidebar);
sidebar.addEventListener('click', event => { if (mobile.matches && event.target.closest('a')) { sidebar.hidden = true; document.querySelector('[data-sc-collapse-target="docs-sidebar"]').setAttribute('aria-expanded', 'false'); } });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && mobile.matches && !sidebar.hidden) { syncSidebar(); document.querySelector('.mobile-nav-trigger').focus(); } });
const components = [...document.querySelectorAll('.component')];
const nav = document.querySelector('#component-nav');
// Capture pristine markup before the library adds generated IDs and ARIA state.
components.forEach(section => {
  const link = document.createElement('a'); link.href = '#' + section.id; link.textContent = section.dataset.title; nav.append(link);
  const source = document.createElement('details'); source.className = 'source';
  const summary = document.createElement('summary'); summary.textContent = 'View HTML';
  const toolbar = document.createElement('div'); toolbar.className = 'source-toolbar';
  const button = document.createElement('button'); button.type = 'button'; button.className = 'sc-button sc-button-ghost sc-button-sm'; button.textContent = 'Copy HTML';
  const pre = document.createElement('pre'); pre.id = section.id + '-source';
  const code = document.createElement('code'); code.textContent = section.querySelector('.preview').innerHTML.trim(); pre.append(code);
  button.dataset.copyTarget = pre.id; toolbar.append(button); source.append(summary, toolbar, pre); section.append(source);
});
document.querySelector('#component-count').textContent = components.length;
document.querySelector('#component-search').addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase(); let count = 0;
  components.forEach((section, i) => {
    const match = (section.dataset.title + ' ' + (section.dataset.keywords || '')).toLowerCase().includes(query);
    section.hidden = !match; nav.children[i].hidden = !match; if (match) count++;
  });
  document.querySelector('#no-results').hidden = count > 0;
});
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy-target]'); if (!button) return;
  const text = document.getElementById(button.dataset.copyTarget)?.textContent; if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    const old = button.dataset.copyLabel || button.textContent; button.dataset.copyLabel = old;
    clearTimeout(button.copyTimer); button.textContent = 'Copied!'; button.copyTimer = setTimeout(() => { button.textContent = old; }, 1500);
  } catch { window.BootstrapCN.toast('Copy unavailable', { description: 'Select the visible code and copy it manually.' }); }
});
