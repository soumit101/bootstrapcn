import { Tooltip, Popover, Combobox, Tab, Datepicker, OtpInput, Carousel, Dialog, Drawer, Menu } from '../vendor/bootstrap.bundle.min.js';
import { scInitExtras, scDisposeExtras } from './components.js';

// This import is removed when concatenating the already-compiled Bootstrap bundle.
const scStorageKey = 'bootstrapcn-theme';
const scMedia = window.matchMedia('(prefers-color-scheme: dark)');
let scTheme = document.documentElement.dataset.scTheme || 'system';
try { scTheme = localStorage.getItem(scStorageKey) || scTheme; } catch { /* Storage is optional. */ }
if (!['light', 'dark', 'system'].includes(scTheme)) scTheme = 'system';
const scPalettes = Object.freeze(['neutral', 'slate', 'stone', 'zinc', 'blue', 'green', 'rose', 'orange', 'violet', 'teal']);
let scPalette = document.documentElement.dataset.scPalette || 'neutral';
try { scPalette = localStorage.getItem(scStorageKey + '-palette') || scPalette; } catch { /* Storage is optional. */ }
if (!scPalettes.includes(scPalette)) scPalette = 'neutral';

function scApplyTheme() {
  const resolved = scTheme === 'system' ? (scMedia.matches ? 'dark' : 'light') : scTheme;
  document.documentElement.dataset.bsTheme = resolved;
  document.documentElement.dataset.scTheme = scTheme;
  document.documentElement.dataset.scPalette = scPalette;
  document.querySelectorAll('[data-sc-theme-value]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.scThemeValue === scTheme));
  });
  document.querySelectorAll('[data-sc-palette-value]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scPaletteValue === scPalette)));
  document.querySelectorAll('[data-sc-palette-select]').forEach(select => { select.value = scPalette; });
  document.dispatchEvent(new CustomEvent('sc:theme', { detail: { theme: scTheme, resolved, palette: scPalette } }));
}

const BootstrapCN = Object.freeze({
  version: '0.3.0',
  palettes: scPalettes,
  bootstrapVersion: '6.0.0-alpha.1',
  setTheme(theme) {
    if (!['light', 'dark', 'system'].includes(theme)) throw new TypeError('Theme must be light, dark, or system.');
    scTheme = theme;
    try { localStorage.setItem(scStorageKey, theme); } catch { /* Storage may be blocked. */ }
    scApplyTheme();
  },
  getTheme() { return scTheme; },
  setPalette(palette) {
    if (!scPalettes.includes(palette)) throw new TypeError('Unknown palette: ' + palette);
    scPalette = palette;
    try { localStorage.setItem(scStorageKey + '-palette', palette); } catch { /* Storage is optional. */ }
    scApplyTheme();
  },
  getPalette() { return scPalette; },
  setDates(element, dates) {
    Datepicker.getOrCreateInstance(element).setSelectedDates(dates);
    element.dispatchEvent(new CustomEvent('change.bs.datepicker', { bubbles: true, detail: { dates } }));
  },
  init(root = document) {
    const find = selector => [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
    find('[data-bs-toggle="tooltip"]').forEach(el => Tooltip.getOrCreateInstance(el));
    find('[data-bs-toggle="popover"]').forEach(el => Popover.getOrCreateInstance(el));
    find('[data-bs-toggle="combobox"]').forEach(el => Combobox.getOrCreateInstance(el));
    find('[data-bs-toggle="tab"]').forEach(el => Tab.getOrCreateInstance(el));
    find('[data-bs-toggle="datepicker"]').forEach(el => Datepicker.getOrCreateInstance(el));
    find('[data-bs-otp]').forEach(el => OtpInput.getOrCreateInstance(el));
    find('.carousel').forEach(el => Carousel.getOrCreateInstance(el));
    find('[data-sc-collapse-target]').forEach(button => { const panel = document.getElementById(button.dataset.scCollapseTarget); if (panel) button.setAttribute('aria-expanded', String(!panel.hidden)); });
    scInitExtras(root);
    scApplyTheme();
  },
  dispose(root) {
    scDisposeExtras(root);
    const plugins = [Tooltip, Popover, Combobox, Tab, Datepicker, OtpInput, Carousel, Dialog, Drawer, Menu];
    for (const el of [root, ...root.querySelectorAll('*')]) plugins.forEach(Plugin => Plugin.getInstance(el)?.dispose());
  },
  toast(title, { description = '', duration = 5000 } = {}) {
    let region = document.querySelector('[data-sc-toast-region]');
    if (!region) {
      region = document.createElement('div');
      region.className = 'sc-toast-region';
      region.dataset.scToastRegion = '';
      region.setAttribute('aria-label', 'Notifications');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-relevant', 'additions');
      document.body.append(region);
    }
    const toast = document.createElement('div');
    toast.className = 'sc-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-atomic', 'true');
    const content = document.createElement('div');
    content.className = 'sc-toast-content';
    const heading = document.createElement('strong');
    heading.textContent = String(title);
    content.append(heading);
    if (description) { const p = document.createElement('p'); p.textContent = String(description); content.append(p); }
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'sc-button sc-button-ghost sc-button-icon';
    close.setAttribute('aria-label', 'Dismiss notification'); close.textContent = '×';
    toast.append(content, close); region.append(toast);
    let timer;
    const dismiss = () => { clearTimeout(timer); toast.remove(); };
    const pause = () => clearTimeout(timer);
    const resume = () => {
      pause();
      if (Number.isFinite(duration) && duration > 0 && !toast.matches(':hover') && !toast.contains(document.activeElement)) timer = setTimeout(dismiss, duration);
    };
    close.addEventListener('click', dismiss);
    toast.addEventListener('mouseenter', pause); toast.addEventListener('mouseleave', resume);
    toast.addEventListener('focusin', pause); toast.addEventListener('focusout', () => queueMicrotask(resume));
    resume();
    return { element: toast, dismiss };
  }
});

scMedia.addEventListener('change', () => { if (scTheme === 'system') scApplyTheme(); });
window.addEventListener('storage', event => {
  if (event.key === scStorageKey) { scTheme = ['light', 'dark'].includes(event.newValue) ? event.newValue : 'system'; scApplyTheme(); }
  if (event.key === scStorageKey + '-palette') { scPalette = scPalettes.includes(event.newValue) ? event.newValue : 'neutral'; scApplyTheme(); }
});
document.addEventListener('change', event => { if (event.target.matches('[data-sc-palette-select]')) BootstrapCN.setPalette(event.target.value); });
document.addEventListener('click', event => {
  const disabled = event.target.closest?.('.sc-button[aria-disabled="true"]');
  if (disabled) { event.preventDefault(); return; }
  const target = event.target.closest?.('[data-sc-theme-value], [data-sc-theme-toggle], [data-sc-toast], [data-sc-toggle], [data-sc-palette-value], [data-sc-collapse-target], [data-sc-copy]');
  if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
  if (target.hasAttribute('data-sc-theme-value')) BootstrapCN.setTheme(target.dataset.scThemeValue);
  if (target.hasAttribute('data-sc-palette-value')) BootstrapCN.setPalette(target.dataset.scPaletteValue);
  if (target.hasAttribute('data-sc-collapse-target')) {
    const panel = document.getElementById(target.dataset.scCollapseTarget);
    if (panel) { panel.hidden = !panel.hidden; document.querySelectorAll('[data-sc-collapse-target]').forEach(button => { if (button.dataset.scCollapseTarget === panel.id) button.setAttribute('aria-expanded', String(!panel.hidden)); }); }
  }
  if (target.hasAttribute('data-sc-copy')) {
    const content = document.getElementById(target.dataset.scCopy);
    if (content) { Promise.resolve().then(() => navigator.clipboard.writeText(content.textContent)).then(() => BootstrapCN.toast('Copied to clipboard'), () => BootstrapCN.toast('Copy unavailable', { description: 'Select the code and copy it manually.' })); }
  }
  if (target.hasAttribute('data-sc-theme-toggle')) BootstrapCN.setTheme(document.documentElement.dataset.bsTheme === 'dark' ? 'light' : 'dark');
  if (target.hasAttribute('data-sc-toast')) BootstrapCN.toast(target.dataset.scToast, { description: target.dataset.scDescription || '' });
  if (target.hasAttribute('data-sc-toggle')) {
    const pressed = target.getAttribute('aria-pressed') !== 'true';
    const group = target.closest('[data-sc-toggle-group="single"]');
    if (group) group.querySelectorAll('[data-sc-toggle]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    target.setAttribute('aria-pressed', String(pressed));
    target.dispatchEvent(new CustomEvent('sc:toggle', { bubbles: true, detail: { pressed } }));
  }
});
scApplyTheme();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => BootstrapCN.init(), { once: true });
else BootstrapCN.init();
window.BootstrapCN = BootstrapCN;
export { BootstrapCN };
