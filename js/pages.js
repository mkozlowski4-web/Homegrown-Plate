/* Page renderers. Each returns an HTML string. */
const Pages = {
  home() {
    return `
      <section class="hero">
        <h1>Grow your own food, whatever your garden size</h1>
        <p>From a single windowsill to a full allotment, find out what to plant, how to look after it, how to harvest it, and what to cook with it.</p>
        <a class="btn" href="#/sizes">Find my garden size</a>
      </section>
      <h2>Explore</h2>
      <div class="grid">
        ${SIZES.map(s => `<div class="card size-card ${s.cls}"><div class="emoji">${s.emoji}</div><h3>${s.title}</h3><p class="muted">${s.desc}</p><a href="#/sizes/${s.id}">See ideas &rarr;</a></div>`).join("")}
      </div>
      <h2>Quick start</h2>
      <div class="grid">
        <div class="card"><h3>Plant Guide</h3><p class="muted">${PLANTS.length} crops with sowing, care, pests and harvest.</p><a href="#/plants">Browse plants &rarr;</a></div>
        <div class="card"><h3>How-To</h3><p class="muted">Seven steps from plan to first harvest.</p><a href="#/howto">Read the guide &rarr;</a></div>
        <div class="card"><h3>Harvesting</h3><p class="muted">Know when and how to pick for best flavour.</p><a href="#/harvest">Learn to harvest &rarr;</a></div>
        <div class="card"><h3>Recipes</h3><p class="muted">${RECIPES.length} recipes built around what you grow.</p><a href="#/recipes">Start cooking &rarr;</a></div>
      </div>`;
  },

  sizes() {
    return `
      <h1>Garden Sizes</h1>
      <p class="lead">Whatever space you have, there is something you can grow. Choose your garden size for tailored advice.</p>
      <div class="grid">
        ${SIZES.map(s => `
          <div class="card size-card ${s.cls}">
            <div class="emoji">${s.emoji}</div>
            <h3>${s.title}</h3>
            <p class="muted">${s.desc}</p>
            <p><strong>Good crops:</strong><br>${s.grow.slice(0, 6).map(id => `<span class="tag">${plantById(id).name}</span>`).join("")}</p>
            <a href="#/sizes/${s.id}">Full guide &rarr;</a>
          </div>`).join("")}
      </div>`;
  },

  sizeDetail(id) {
    const s = sizeById(id);
    if (!s) return this.notFound();
    return `
      <a class="back" href="#/sizes">&larr; All garden sizes</a>
      <h1>${s.emoji} ${s.title}</h1>
      <p class="lead">${s.desc}</p>
      <h2>Top tips for this space</h2>
      <ul class="tips">${s.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      <h2>Recommended crops</h2>
      <div class="grid">
        ${s.grow.map(plantById).map(p => `<div class="card"><div class="emoji">${p.emoji}</div><h3>${p.name}</h3><span class="tag">${p.difficulty}</span><p class="muted" style="margin:8px 0 0">${esc(p.sow)}</p><a href="#/plants/${p.id}">Grow ${p.name} &rarr;</a></div>`).join("")}
      </div>`;
  },

  plants() {
    return `
      <h1>Plant Guide</h1>
      <p class="lead">Search crops or filter by the garden size you have.</p>
      <div class="filters">
        <div><input type="search" id="plantSearch" placeholder="Search by name or sunlight..."></div>
        <div>
          <select id="plantSize">
            <option value="all">All garden sizes</option>
            ${SIZES.map(s => `<option value="${s.id}">${s.title}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="grid" id="plantGrid"></div>`;
  },

  // Renders only the grid so the search box keeps focus while typing.
  plantGridHTML(query = "", size = "all") {
    const q = query.trim().toLowerCase();
    const list = PLANTS.filter(p =>
      (size === "all" || p.sizes.includes(size)) &&
      (p.name.toLowerCase().includes(q) || p.sun.toLowerCase().includes(q))
    );
    if (!list.length) return `<div class="empty">No crops match your search.</div>`;
    return list.map(p => `
      <a href="#/plants/${p.id}" class="card">
        <div class="emoji">${p.emoji}</div>
        <h3>${p.name}</h3>
        <span class="tag">${p.difficulty}</span>
        <span class="tag warm">${p.sun.split(" (")[0]}</span>
        <p class="muted" style="margin:8px 0 0;font-size:.92rem">${esc(p.sow)}</p>
      </a>`).join("");
  },

  plantDetail(id) {
    const p = plantById(id);
    if (!p) return this.notFound();
    const related = RECIPES.filter(r => r.uses.includes(p.id));
    return `
      <a class="back" href="#/plants">&larr; Plant Guide</a>
      <h1>${p.emoji} ${p.name}</h1>
      <p>
        <span class="tag">Difficulty: ${p.difficulty}</span>
        ${p.sizes.map(s => `<span class="tag warm">${sizeById(s).title}</span>`).join("")}
      </p>
      <div class="info-row">
        <div>Sunlight</div><div>${esc(p.sun)}</div>
        <div>When to sow</div><div>${esc(p.sow)}</div>
        <div>Spacing</div><div>${esc(p.spacing)}</div>
        <div>Sowing depth</div><div>${esc(p.depth)}</div>
        <div>Watering</div><div>${esc(p.water)}</div>
      </div>
      <h2>Keeping it alive</h2>
      <ul class="tips">${p.care.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
      <h3>Watch out for</h3>
      <p>${p.pests.map(x => `<span class="tag red">${esc(x)}</span>`).join("")}</p>
      <h2>Harvesting</h2>
      <p>${esc(p.harvest)}</p>
      <p><strong>Storage:</strong> ${esc(p.storage)}</p>
      ${related.length ? `<h2>Cook with ${p.name.toLowerCase()}</h2>
        <div class="grid">${related.map(r => `<a class="card" href="#/recipes/${r.id}"><h3>${r.title}</h3><p class="muted">${r.time} &middot; serves ${r.serves}</p>View recipe &rarr;</a>`).join("")}</div>` : ""}`;
  },

  howto() {
    return `
      <h1>How to Grow</h1>
      <p class="lead">A simple seven-step process that works in any garden.</p>
      ${HOWTO.map((s, i) => `<div class="step"><div class="num">${i + 1}</div><div><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div></div>`).join("")}`;
  },

  harvest() {
    return `
      <h1>Harvesting</h1>
      <p class="lead">Pick at the right time, handle with care, and make the most of every crop.</p>
      <div class="grid">
        ${HARVEST.map(h => `<div class="card"><h3>${esc(h.title)}</h3><p class="muted" style="margin:0">${esc(h.body)}</p></div>`).join("")}
      </div>`;
  },

  recipes() {
    return `
      <h1>Garden Recipes</h1>
      <p class="lead">Every recipe is built around crops you can grow yourself.</p>
      <div class="filters">
        <div></div>
        <div>
          <select id="recipeFilter">
            <option value="all">All crops</option>
            ${PLANTS.filter(p => RECIPES.some(r => r.uses.includes(p.id))).map(p => `<option value="${p.id}">${p.emoji} ${p.name}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="grid" id="recipeGrid"></div>`;
  },

  recipeGridHTML(filter = "all") {
    const list = filter === "all" ? RECIPES : RECIPES.filter(r => r.uses.includes(filter));
    if (!list.length) return `<div class="empty">No recipes for that crop yet.</div>`;
    return list.map(r => `
      <a href="#/recipes/${r.id}" class="card">
        <h3>${r.title}</h3>
        <p class="muted" style="margin:4px 0">${r.time} &middot; serves ${r.serves}</p>
        <p style="margin:6px 0 0">${r.uses.map(u => { const p = plantById(u); return p ? `<span class="tag">${p.emoji} ${p.name}</span>` : ""; }).join("")}</p>
      </a>`).join("");
  },

  recipeDetail(id) {
    const r = RECIPES.find(x => x.id === id);
    if (!r) return this.notFound();
    return `
      <a class="back" href="#/recipes">&larr; All recipes</a>
      <h1>${r.title}</h1>
      <p class="muted">${r.time} &middot; serves ${r.serves}</p>
      <p>Crops from your garden in this recipe:
        ${r.uses.map(u => { const p = plantById(u); return p ? `<a href="#/plants/${p.id}" class="tag">${p.emoji} ${p.name}</a>` : ""; }).join("")}
      </p>
      <h2>Ingredients</h2>
      <ul>
        ${r.ingredients.map(([key, label, qty]) => {
          const grown = plantById(key);
          return `<li class="${grown ? "ing-have" : "ing-need"}">${esc(qty)} ${esc(label)}${grown ? " &#127807;" : ""}</li>`;
        }).join("")}
      </ul>
      <p class="muted" style="font-size:.9rem">Green items are grown in this garden.</p>
      <h2>Method</h2>
      <div class="recipe-steps"><ol>${r.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>`;
  },

  notFound() {
    return `<h1>Page not found</h1><p><a href="#/">Go home</a></p>`;
  }
};
