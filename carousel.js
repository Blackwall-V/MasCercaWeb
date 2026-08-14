// ponytail: carousel logic. Native scroll-snap handles the snapping; JS only wires
// the prev/next buttons and keeps their disabled state in sync with scroll position.
(() => {
  const track = document.getElementById('gallery');
  if (!track) return;
  const prev = document.querySelector('.carousel__btn--prev');
  const next = document.querySelector('.carousel__btn--next');
  if (!prev || !next) return;

  // Returns the scroll distance needed to advance one photo (item width + gap).
  const step = () => {
    const item = track.querySelector('img');
    if (!item) return 0;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return item.getBoundingClientRect().width + gap;
  };

  const updateButtons = () => {
    const max = track.scrollWidth - track.clientWidth - 1;
    prev.disabled = track.scrollLeft <= 0;
    next.disabled = track.scrollLeft >= max;
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left:  step(), behavior: 'smooth' }));

  track.addEventListener('scroll', () => {
    // ponytail: rAF coalesces scroll events so we don't thrash layout.
    if (track._rafId) return;
    track._rafId = requestAnimationFrame(() => {
      updateButtons();
      track._rafId = null;
    });
  });

  window.addEventListener('resize', updateButtons);
  updateButtons();
})();
