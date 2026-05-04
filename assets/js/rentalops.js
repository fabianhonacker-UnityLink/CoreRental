(function(){
  const dock = document.querySelector('.category-dock');
  const dockButtons = document.querySelectorAll('.dock-item');
  const cards = document.querySelectorAll('.rental-card');
  const title = document.getElementById('selectedTitle');
  const sub = document.getElementById('selectedSub');
  const dayRate = document.getElementById('dayRate');
  const totalPrice = document.getElementById('totalPrice');
  const daysCount = document.getElementById('daysCount');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  let selectedPrice = 129;

  function calcDays(){
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    if(Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start){
      daysCount.textContent = 'Datum prüfen';
      totalPrice.textContent = '—';
      return;
    }
    const diff = Math.round((end - start) / 86400000) + 1;
    daysCount.textContent = diff + (diff === 1 ? ' Tag' : ' Tage');
    dayRate.textContent = selectedPrice + ' €';
    totalPrice.textContent = (diff * selectedPrice).toLocaleString('de-DE') + ' €';
  }

  function selectCard(card){
    cards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedPrice = Number(card.dataset.price || 0);
    title.textContent = card.dataset.title || 'Mietobjekt';
    sub.textContent = card.dataset.sub || 'Verfügbarkeit prüfen';
    calcDays();
  }

  /* RENTALOPS-MOCKUP-009 · Kontextbewusstes Kategorie-Dock
     Die Filterleiste gehört jetzt sichtbar zur Mietflotte. Sobald man in
     Anfrage, Ablauf, Portal oder System dahinter ist, wird sie ausgeblendet.
     Klickt man eine Kategorie, springt die Seite sauber zur Mietflotte zurück. */
  function getStickyOffset(includeDock){
    const nav = document.querySelector('.nav-bar');
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;
    const dockHeight = includeDock && dock ? dock.getBoundingClientRect().height : 0;
    return Math.round(navHeight + dockHeight + 28);
  }

  function scrollToTarget(target, includeDock){
    if(!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - getStickyOffset(includeDock);
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function updateDockVisibility(){
    if(!dock) return;
    const fleetHead = document.getElementById('fleet');
    const fleetGrid = document.querySelector('.fleet-experience');
    if(!fleetHead || !fleetGrid) return;

    const viewportAnchor = window.scrollY + getStickyOffset(false) + 28;
    const fleetStart = fleetHead.offsetTop - 18;
    const fleetEnd = fleetGrid.offsetTop + fleetGrid.offsetHeight - 48;
    const isFleetZone = viewportAnchor >= fleetStart && viewportAnchor <= fleetEnd;

    dock.classList.toggle('dock-hidden', !isFleetZone);
    dock.setAttribute('aria-hidden', isFleetZone ? 'false' : 'true');
  }

  dockButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dockButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.type === filter;
        card.style.display = show ? '' : 'none';
      });

      const fleetTarget = document.getElementById('fleet');
      scrollToTarget(fleetTarget, true);
      window.setTimeout(updateDockVisibility, 280);
    });
  });

  cards.forEach(card => card.addEventListener('click', () => selectCard(card)));
  [startDate,endDate].forEach(input => input.addEventListener('change', calcDays));
  calcDays();

  /* RENTALOPS-MOCKUP-009 · Saubere Anker-Navigation
     Sticky Header + optional sichtbares Kategorie-Dock werden berücksichtigt,
     damit Sektionen nicht halb angesprungen werden. */
  const scrollLinks = document.querySelectorAll('a[href^="#"]');

  scrollLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if(!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if(!target) return;
      event.preventDefault();
      const includeDock = href === '#fleet';
      scrollToTarget(target, includeDock);
      if(history.pushState){ history.pushState(null, '', href); }
      window.setTimeout(updateDockVisibility, 280);
    });
  });

  window.addEventListener('scroll', updateDockVisibility, { passive: true });
  window.addEventListener('resize', updateDockVisibility);
  updateDockVisibility();
})();
