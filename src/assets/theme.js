/* Applies Kids mode before the page paints, so there is no flash. */
try { if (localStorage.getItem('hp-kids') === '1') document.documentElement.setAttribute('data-kids', '1'); } catch (e) { /* storage unavailable */ }
