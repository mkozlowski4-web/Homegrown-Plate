/* Hash-based router. Works on any static host with no server configuration. */
const ROUTES = {
  '':        { nav: 'home',    render: () => Pages.home() },
  sizes:     { nav: 'sizes',   render: (sub) => sub ? Pages.sizeDetail(sub) : Pages.sizes() },
  plants:    { nav: 'plants',  render: (sub) => sub ? Pages.plantDetail(sub) : Pages.plants(), afterRender: bindPlantFilters },
  howto:     { nav: 'howto',   render: () => Pages.howto() },
  harvest:   { nav: 'harvest', render: () => Pages.harvest() },
  recipes:   { nav: 'recipes', render: (sub) => sub ? Pages.recipeDetail(sub) : Pages.recipes(), afterRender: bindRecipeFilter }
};

function route() {
  const [section = '', sub] = location.hash.replace(/^#\/?/, '').split('/');
  const r = ROUTES[section];
  const app = $('#app');

  if (!r) {
    app.innerHTML = Pages.notFound();
    setActiveNav('');
    return;
  }

  app.innerHTML = r.render(sub);
  setActiveNav(r.nav);
  if (r.afterRender) r.afterRender();
  window.scrollTo(0, 0);
}

function setActiveNav(name) {
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.route === name));
}

function bindPlantFilters() {
  const search = $('#plantSearch');
  const size = $('#plantSize');
  const grid = $('#plantGrid');
  const update = () => { grid.innerHTML = Pages.plantGridHTML(search.value, size.value); };
  search.addEventListener('input', update);
  size.addEventListener('change', update);
  update();
}

function bindRecipeFilter() {
  const select = $('#recipeFilter');
  const grid = $('#recipeGrid');
  const update = () => { grid.innerHTML = Pages.recipeGridHTML(select.value); };
  select.addEventListener('change', update);
  update();
}

window.addEventListener('hashchange', route);
route();
