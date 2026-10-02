/* Shared across every page.
   Reads the event spotlights on events.html (#spotlights > .spotlight) and builds:
   1. an announcement bar at the top of every page for the current headliner
   2. the "Tickets On Sale" row on the homepage (#tickets-row), up to 3 events
   Upcoming only (Eastern time), headliners first, then by date. */
(function () {
  function todayET() {
    var t = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }

  function readEvents(doc) {
    var today = todayET();
    return Array.prototype.slice.call(doc.querySelectorAll('#spotlights > .spotlight'))
      .filter(function (el) { return el.getAttribute('data-date') >= today && el.getAttribute('data-tickets'); })
      .map(function (el) {
        var img = el.querySelector('img');
        return {
          id: el.id,
          date: el.getAttribute('data-date'),
          headliner: el.hasAttribute('data-headliner'),
          title: el.querySelector('h2').textContent.trim(),
          when: el.getAttribute('data-when') || '',
          price: el.getAttribute('data-price') || '',
          tickets: el.getAttribute('data-tickets'),
          flyer: img ? img.getAttribute('src') : '',
          flyerAlt: img ? img.getAttribute('alt') : ''
        };
      })
      .sort(function (a, b) {
        if (a.headliner !== b.headliner) return a.headliner ? -1 : 1;
        return a.date < b.date ? -1 : 1;
      });
  }

  function announcementBar(ev) {
    var bar = document.createElement('div');
    bar.className = 'announce-bar';
    bar.style.cssText = 'background:#DC9C48; color:#1a1917; text-align:center; font-size:14px; padding:9px 16px; line-height:1.5;';
    bar.innerHTML =
      '<a href="events.html#' + ev.id + '" style="color:#1a1917; font-weight:700;">' + ev.title + '</a>' +
      ' &middot; ' + ev.when +
      ' &middot; <a href="' + ev.tickets + '" target="_blank" rel="noopener" style="color:#1a1917; font-weight:700; text-decoration:underline;">Get Tickets &rarr;</a>';
    document.body.insertBefore(bar, document.body.firstChild);
  }

  function ticketsRow(box, events) {
    var section = box.closest('.section');
    if (!events.length) { if (section) section.style.display = 'none'; return; }
    box.innerHTML = events.slice(0, 3).map(function (ev) {
      return '<div class="ticket-card" style="width:32%; display:flex; gap:16px; background:#2C2635; border:1px solid rgba(244,238,223,0.14); border-radius:3px; padding:16px;">' +
        '<a href="events.html#' + ev.id + '" style="width:110px; flex:0 0 110px;"><img src="' + ev.flyer + '" alt="' + ev.flyerAlt + '" style="width:110px; height:110px; object-fit:cover; display:block; border-radius:2px;"></a>' +
        '<div style="min-width:0;">' +
          '<div style="font-size:11px; color:#DC9C48; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">' + ev.when.split(' · ')[0] + '</div>' +
          '<a href="events.html#' + ev.id + '" style="display:block; font-family:\'Cinzel Decorative\', Georgia, serif; font-size:15px; line-height:1.3; color:#f0e2c9; margin-bottom:6px;">' + ev.title + '</a>' +
          '<div style="font-size:12.5px; color:#BFB393; margin-bottom:10px;">' + ev.price + '</div>' +
          '<a href="' + ev.tickets + '" target="_blank" rel="noopener" class="btn btn-solid" style="padding:8px 14px; font-size:11px;">Get Tickets</a>' +
        '</div></div>';
    }).join('');
  }

  function build(doc) {
    var events = readEvents(doc);
    var headliner = events.filter(function (e) { return e.headliner; })[0];
    if (headliner) announcementBar(headliner);
    var box = document.getElementById('tickets-row');
    if (box) ticketsRow(box, events);
  }

  if (document.getElementById('spotlights')) {
    build(document);
  } else {
    fetch('events.html')
      .then(function (r) { return r.text(); })
      .then(function (html) { build(new DOMParser().parseFromString(html, 'text/html')); })
      .catch(function () {
        var box = document.getElementById('tickets-row');
        if (box && box.closest('.section')) box.closest('.section').style.display = 'none';
      });
  }
})();
