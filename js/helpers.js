/* Shared helpers. Loaded after the data files. */
const $ = sel => document.querySelector(sel);
const plantById = id => PLANTS.find(p => p.id === id);
const sizeById = id => SIZES.find(s => s.id === id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
