import { Datepicker, Combobox, OtpInput } from '../vendor/bootstrap.bundle.min.js';
// Controllers use AbortController so repeated initialization and disposal are safe.
const scControllers = new WeakMap();
const scFind = (root, selector) => [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
function scMount(el, setup) {
  if (scControllers.has(el)) return;
  const controller = new AbortController();
  const on = (target, type, handler) => target.addEventListener(type, handler, { signal: controller.signal });
  const cleanup = setup(on) || (() => {});
  scControllers.set(el, () => { controller.abort(); cleanup(); });
}
function scInitExtras(root) {
  scFind(root, '[data-bs-toggle="combobox"]').forEach(el => scMount(el, on => {
    const menu = el.nextElementSibling; if (!menu) return;
    const initial = [...menu.querySelectorAll('.menu-item.selected')];
    const syncDisabled = () => { const input = el.previousElementSibling; if (input?.matches('input[type="hidden"]')) input.disabled = el.disabled; };
    const observer = new MutationObserver(syncDisabled); observer.observe(el, { attributes: true, attributeFilter: ['disabled'] }); syncDisabled();
    if (el.form) on(el.form, 'reset', event => queueMicrotask(() => {
      if (event.defaultPrevented) return;
      Combobox.getInstance(el)?.dispose();
      menu.querySelectorAll('.menu-item').forEach(item => { item.classList.toggle('selected', initial.includes(item)); item.setAttribute('aria-selected', String(initial.includes(item))); });
      Combobox.getOrCreateInstance(el); syncDisabled();
    }));
    return () => observer.disconnect();
  }));
  scFind(root, '[data-bs-otp]').forEach(el => scMount(el, on => {
    const input = el.querySelector('input'); if (!input?.form) return;
    on(input.form, 'reset', event => queueMicrotask(() => { if (!event.defaultPrevented) OtpInput.getOrCreateInstance(el).setValue(input.defaultValue); }));
  }));
  scFind(root, 'input[data-bs-toggle="datepicker"]:not([data-sc-date-input])').forEach(el => scMount(el, on => {
    const initial = Datepicker.getOrCreateInstance(el).getSelectedDates();
    if (el.form) on(el.form, 'reset', event => queueMicrotask(() => { if (!event.defaultPrevented) Datepicker.getOrCreateInstance(el).setSelectedDates(initial); }));
  }));
  scFind(root, '[data-sc-date-input]').forEach(el => scMount(el, on => {
    const input = document.getElementById(el.dataset.scDateInput); if (!input) return;
    const initial = input.value;
    const sync = () => { input.value = Datepicker.getOrCreateInstance(el).getSelectedDates().join(','); };
    on(el, 'change.bs.datepicker', () => { sync(); input.dispatchEvent(new Event('change', { bubbles: true })); });
    if (input.form) on(input.form, 'reset', event => queueMicrotask(() => { if (!event.defaultPrevented) { Datepicker.getOrCreateInstance(el).setSelectedDates(initial ? initial.split(',') : []); sync(); } }));
    sync();
  }));
  scFind(root, '[data-sc-command]').forEach(el => scMount(el, on => {
    const input = el.querySelector('input');
    const items = [...el.querySelectorAll('[data-sc-command-item]')];
    if (!input) return;
    const visible = () => items.filter(item => !item.hidden && !item.disabled && item.getAttribute('aria-disabled') !== 'true');
    const filter = () => {
      const query = input.value.trim().toLocaleLowerCase();
      items.forEach(item => { item.hidden = !((item.dataset.scKeywords || '') + ' ' + item.textContent).toLocaleLowerCase().includes(query); });
      const empty = el.querySelector('[data-sc-command-empty]'); if (empty) empty.hidden = visible().length > 0;
    };
    on(input, 'input', filter);
    on(el, 'keydown', event => {
      const list = visible(); const index = list.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const next = event.key === 'ArrowDown' ? (index + 1) % list.length : index <= 0 ? list.length - 1 : index - 1;
        list[next]?.focus();
      } else if (event.key === 'Escape') { input.value = ''; filter(); input.focus(); }
      else if (event.key === 'Enter' && event.target === input) { event.preventDefault(); list[0]?.click(); }
      else if (event.target !== input && ['Home', 'End'].includes(event.key)) { event.preventDefault(); list[event.key === 'Home' ? 0 : list.length - 1]?.focus(); }
    });
    filter();
  }));
  scFind(root, '[data-sc-table]').forEach(el => scMount(el, on => {
    const body = el.querySelector('tbody'); if (!body) return;
    const rows = [...body.rows]; const input = el.querySelector('[data-sc-table-filter]');
    const size = Math.max(1, parseInt(el.dataset.scPageSize, 10) || 5);
    let page = 0, column = -1, direction = 1;
    const headers = [...el.querySelectorAll('[data-sc-sort]')];
    const all = el.querySelector('[data-sc-select-all]');
    let filtered = [];
    const updateSelection = () => {
      const selected = rows.filter(row => row.querySelector('[data-sc-row-select]')?.checked).length;
      const count = el.querySelector('[data-sc-selection-count]'); if (count) count.textContent = `${selected} selected`;
      const selectable = filtered.map(row => row.querySelector('[data-sc-row-select]')).filter(box => box && !box.disabled);
      if (all) { all.checked = selectable.length > 0 && selectable.every(box => box.checked); all.indeterminate = !all.checked && selectable.some(box => box.checked); all.disabled = selectable.length === 0; }
    };
    const render = () => {
      const query = input?.value.trim().toLocaleLowerCase() || '';
      filtered = rows.filter(row => row.textContent.toLocaleLowerCase().includes(query));
      if (column >= 0) filtered.sort((a, b) => {
        const aa = a.cells[column], bb = b.cells[column];
        const av = aa?.dataset.scSortValue ?? aa?.textContent.trim() ?? '';
        const bv = bb?.dataset.scSortValue ?? bb?.textContent.trim() ?? '';
        const numeric = value => /^[-+]?\d+(?:\.\d+)?$/.test(value);
        return direction * (numeric(av) && numeric(bv) ? Number(av) - Number(bv) : av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' }));
      });
      const pages = Math.max(1, Math.ceil(filtered.length / size)); page = Math.min(page, pages - 1);
      rows.forEach(row => { row.hidden = true; });
      filtered.forEach((row, index) => { body.append(row); row.hidden = index < page * size || index >= (page + 1) * size; });
      const info = el.querySelector('[data-sc-page-info]'); if (info) info.textContent = `${filtered.length} results · Page ${page + 1} of ${pages}`;
      const prev = el.querySelector('[data-sc-page-prev]'); if (prev) prev.disabled = page === 0;
      const next = el.querySelector('[data-sc-page-next]'); if (next) next.disabled = page >= pages - 1;
      const empty = el.querySelector('[data-sc-table-empty]'); if (empty) empty.hidden = filtered.length > 0;
      updateSelection();
    };
    if (input) on(input, 'input', () => { page = 0; render(); });
    on(el, 'click', event => {
      const sort = event.target.closest('[data-sc-sort]');
      if (sort && el.contains(sort)) {
        const index = sort.closest('th').cellIndex; direction = index === column ? -direction : 1; column = index; page = 0;
        headers.forEach(button => button.closest('th').setAttribute('aria-sort', button === sort ? direction === 1 ? 'ascending' : 'descending' : 'none'));
        render();
      }
      if (event.target.closest('[data-sc-page-prev]')) { page = Math.max(0, page - 1); render(); }
      if (event.target.closest('[data-sc-page-next]')) { page++; render(); }
    });
    on(el, 'change', event => {
      if (event.target === all) filtered.forEach(row => { const box = row.querySelector('[data-sc-row-select]'); if (box && !box.disabled) box.checked = all.checked; });
      updateSelection();
    });
    render();
    return () => { rows.forEach(row => { row.hidden = false; body.append(row); }); };
  }));
  scFind(root, '[data-sc-resizable]').forEach(el => scMount(el, on => {
    const handle = el.querySelector('[role="separator"]'); if (!handle) return;
    let value = Math.min(80, Math.max(20, Number(handle.getAttribute('aria-valuenow')) || 50));
    let drag = null;
    const set = next => { value = Math.min(80, Math.max(20, next)); el.style.setProperty('--sc-panel-size', value + '%'); handle.setAttribute('aria-valuenow', String(Math.round(value))); };
    const sign = () => getComputedStyle(el).direction === 'rtl' ? -1 : 1;
    on(handle, 'keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); set(event.key === 'Home' ? 20 : event.key === 'End' ? 80 : value + (event.key === 'ArrowRight' ? 5 : -5) * sign());
    });
    on(handle, 'pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault(); handle.focus(); drag?.abort(); drag = new AbortController();
      const rect = el.getBoundingClientRect();
      document.addEventListener('pointermove', e => { const ratio = (e.clientX - rect.left) / rect.width * 100; set(sign() === 1 ? ratio : 100 - ratio); }, { signal: drag.signal });
      const end = () => drag?.abort();
      document.addEventListener('pointerup', end, { signal: drag.signal, once: true });
      document.addEventListener('pointercancel', end, { signal: drag.signal, once: true });
    });
    set(value); return () => drag?.abort();
  }));
  scFind(root, '[data-sc-context-target]').forEach(el => scMount(el, on => {
    const menu = document.getElementById(el.dataset.scContextTarget); if (!menu) return;
    const items = () => [...menu.querySelectorAll('[role="menuitem"]')].filter(item => !item.disabled && item.getAttribute('aria-disabled') !== 'true');
    const open = (x, y) => {
      menu.showPopover();
      menu.style.left = `${Math.max(8, Math.min(x, innerWidth - menu.offsetWidth - 8))}px`;
      menu.style.top = `${Math.max(8, Math.min(y, innerHeight - menu.offsetHeight - 8))}px`;
      items()[0]?.focus();
    };
    on(el, 'contextmenu', event => { event.preventDefault(); open(event.clientX, event.clientY); });
    on(el, 'keydown', event => { if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) { event.preventDefault(); const rect = el.getBoundingClientRect(); open(rect.left, rect.bottom); } });
    on(menu, 'keydown', event => {
      const list = items(); const index = list.indexOf(document.activeElement);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); list[event.key === 'Home' ? 0 : event.key === 'End' ? list.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus(); }
      if (event.key === 'Escape') { event.preventDefault(); menu.hidePopover(); el.focus(); }
    });
    on(menu, 'click', event => { if (event.target.closest('[role="menuitem"]')) { menu.hidePopover(); el.focus(); } });
    return () => { if (menu.matches(':popover-open')) menu.hidePopover(); };
  }));
  scFind(root, '[data-sc-chart]').forEach(el => scMount(el, () => {
    const table = el.querySelector('table'); if (!table) return;
    const rows = [...table.tBodies[0].rows];
    const values = rows.map(row => Number(row.cells[1].textContent));
    const max = Math.max(1, ...values.filter(Number.isFinite));
    const chart = document.createElement('div'); chart.className = 'sc-chart-bars'; chart.setAttribute('aria-hidden', 'true');
    rows.forEach((row, index) => {
      const column = document.createElement('div'); column.className = 'sc-chart-column';
      const label = document.createElement('span'); label.textContent = row.cells[0].textContent;
      const value = document.createElement('span'); value.textContent = row.cells[1].textContent;
      const bar = document.createElement('span'); bar.className = 'sc-chart-bar'; bar.style.height = Math.max(0, (Number.isFinite(values[index]) ? values[index] : 0) / max * 140) + 'px';
      column.append(value, bar, label); chart.append(column);
    });
    el.prepend(chart); return () => chart.remove();
  }));
}
function scDisposeExtras(root) {
  for (const el of [root, ...root.querySelectorAll('*')]) { scControllers.get(el)?.(); scControllers.delete(el); }
}
export { scInitExtras, scDisposeExtras };
