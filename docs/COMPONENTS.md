# Component coverage and behavior

The library provides **53 copyable example groups for 66 named patterns** in the [shadcn component index](https://ui.shadcn.com/docs/components), reviewed October 23, 2026. [coverage.json](coverage.json) maps every name to its gallery anchor. The search accepts aliases such as Native Select, Radio Group, Kbd, Sheet, and Message Scroller. The distribution test fails on missing targets or duplicate IDs.

This is an HTML/PHP adaptation. Coverage means a working implementation of the pattern is present; it does not mean every React prop, animation, specialized chart type, calendar system, or backend workflow is reproduced.

## Interactive additions

| Component | Contract |
| --- | --- |
| Command | `[data-sc-command]` contains a search input and `[data-sc-command-item]` buttons/links. Optional `data-sc-keywords` extends search. Arrow keys move through visible enabled results; Enter on the input activates the first result; Escape clears the filter. Home/End move to the first/last result when a result is focused. Use real links or application event listeners for actions. |
| Data Table | `[data-sc-table]` contains a semantic table. `data-sc-page-size` defaults to 5. `[data-sc-table-filter]` filters all rendered rows; `[data-sc-sort]` buttons inside headers sort their columns. Use `data-sc-sort-value` on cells to sort a raw value instead of formatted display text. `[data-sc-page-prev]`, `[data-sc-page-next]`, `[data-sc-page-info]` implement pagination. `[data-sc-row-select]` and `[data-sc-select-all]` select rows; Select All covers **all filtered rows**, including other pages. Wrap the component in a form to submit named checkboxes. Call dispose/init after replacing the row set. This is client-side pagination, not a database query API. |
| Context Menu | A focusable `[data-sc-context-target="menu-id"]` target opens a `.sc-context-menu[popover="auto"][role="menu"]`. Right-click or Shift+F10 opens it; arrows/Home/End move among enabled menu items; Escape and activation close and restore focus. Native popover handles outside dismissal. Provide another visible action menu when touch users need the same actions. |
| Resizable | `[data-sc-resizable]` contains two `[data-sc-panel]` elements and a focusable separator handle. Pointer dragging and left/right arrows resize between 20% and 80%; Home/End go to bounds. `aria-valuenow` stays synchronized and RTL direction reverses horizontal movement. Two horizontal panels are supported. |
| Sidebar / collapsible panel | `[data-sc-collapse-target="panel-id"]` toggles the target's `hidden` state and updates all matching triggers' `aria-expanded`. Use `.sc-sidebar-layout`, `.sc-sidebar`, `.sc-sidebar-content` for the supplied layout. It stacks at narrow widths. This is a collapsible region, not a modal focus trap. Use Bootstrap Drawer for modal navigation. |
| Toggle Group | Wrap toggle buttons in `[data-sc-toggle-group="single"]` for at most one pressed button, or omit single mode for independent buttons. This is a button group, not a required radio field. Use named radio inputs for required form choices. |
| Chart | `[data-sc-chart]` derives bars from the first table body's two-column rows: label, numeric value. The source table remains available inside a disclosure. Use nonnegative values and one series. CSS tokens `--sc-chart-1`, `--sc-chart-2`, `--sc-chart-3` customize bar colors. Dispose/init to regenerate after changing data. |
| Code Block | `.sc-code-block` formats escaped code. `[data-sc-copy="element-id"]` copies text through the Clipboard API and announces success/failure. No unsafe HTML evaluation or remote syntax-highlighting dependency. |

## Calendar and PHP values

Bootstrap 6 supplies calendars, date pickers, date ranges and OTP. The library initializes these after dynamic insertion through `BootstrapCN.init(root)`.

For an inline calendar, place the named hidden input **outside** the rendered calendar. Bootstrap alpha's calendar renderer replaces its own contents. Bind the external input with `data-sc-date-input`:

```html
<form method="post">
  <input type="hidden" id="booking-value" name="booking" value="2026-10-23">
  <div data-bs-toggle="datepicker" data-bs-inline="true"
       data-bs-selected-dates='["2026-10-23"]'
       data-sc-date-input="booking-value"></div>
</form>
```

The hidden field receives ISO dates joined by commas. It updates on user selection and resets to the initial value with `form.reset()`. To change the selection programmatically **and** synchronize the external field, use `BootstrapCN.setDates(calendarElement, ['2026-10-25'])`.

Input-based Bootstrap date pickers display locale-formatted dates. For predictable PHP parsing, give the visible input a separate name (or omit its name) and bind an external hidden ISO field with `data-sc-date-input` in the same way. Range selection uses `data-bs-selection-mode="multiple-ranged"`. Validate dates and ranges in PHP.

OTP uses one real named input, so a complete code posts as one string, including leading zeros. Combobox uses `data-bs-name` to create a hidden form field. The library synchronizes form resets for combobox, OTP, and date pickers, and omits the combobox field when its button is disabled.

## Presentation and composition

Alert Dialog uses a native dialog with confirmation semantics; a static backdrop prevents accidental outside dismissal. The cancel button is the initial focus target. Hover Card is informational content opened by hover or focus, not an interactive popover. Menubar and Navigation Menu are standard navigation groups composed with Bootstrap menus, retaining native Tab navigation and Bootstrap's menu keys rather than imposing desktop menubar ARIA semantics.

Attachment is a native file field: upload handling, storage and validation belong to PHP. Message, Bubble, Message Scroller, Marker and Trace are presentation primitives; supply your own content and backend. Questionnaire uses a native fieldset and labeled inputs. Direction uses standard `dir`/`lang` attributes. Native Scroll Area uses the browser's scrollbars and touch/keyboard scrolling. Typography, Item, Aspect Ratio, Spinner, Button Group, Input Group and other static components require only the stylesheet.

All gallery HTML can be copied from View HTML. IDs must be unique when pasting more than one copy; update associated labels, `aria-*` references, and target attributes together.
