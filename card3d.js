/**
 * <card-3d> — Tarjeta 3D vertical con grosor real, esquinas redondeadas
 * en 3D y rotacion libre de 360 grados.
 * -------------------------------------------------------------------------
 * Web Component autocontenido (Shadow DOM), sin dependencias.
 * Se puede insertar en cualquier pagina web como una etiqueta HTML normal.
 *
 * USO BASICO:
 *   <script src="card3d.js"></script>
 *   <card-3d front="frente.jpg" back="reverso.jpg"></card-3d>
 *
 * ATRIBUTOS:
 *   front     -> URL de la imagen del frente (ocupa toda la tarjeta)
 *   back      -> URL de la imagen del reverso (ocupa toda la tarjeta)
 *   width     -> ancho en px (por defecto 260)
 *   height    -> alto en px (por defecto 380, formato vertical)
 *   radius    -> radio de borde en px (por defecto 18)
 *   thickness -> grosor de la tarjeta en px (por defecto 3)
 *
 * API en JavaScript:
 *   const card = document.querySelector('card-3d');
 *   card.setFront('nueva.jpg');
 *   card.setBack('otra.jpg');
 *   card.reset();          // vuelve a la posicion inicial
 */

class Card3D extends HTMLElement {
  static get observedAttributes() {
    return ['front', 'back', 'width', 'height', 'radius', 'thickness'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._rotX = 0;
    this._rotY = 0;
    this._dragging = false;
    this._lastX = 0;
    this._lastY = 0;

    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
  }

  connectedCallback() {
    this._render();
    this._card = this.shadowRoot.querySelector('.card');
    this._scene = this.shadowRoot.querySelector('.scene');

    // El arrastre funciona en cualquier punto de la tarjeta
    this._scene.addEventListener('mousedown', this._onDown);
    window.addEventListener('mousemove', this._onMove);
    window.addEventListener('mouseup', this._onUp);

    this._scene.addEventListener('touchstart', this._onDown, { passive: true });
    window.addEventListener('touchmove', this._onMove, { passive: false });
    window.addEventListener('touchend', this._onUp);
  }

  disconnectedCallback() {
    window.removeEventListener('mousemove', this._onMove);
    window.removeEventListener('mouseup', this._onUp);
    window.removeEventListener('touchmove', this._onMove);
    window.removeEventListener('touchend', this._onUp);
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML) this._render();
  }

  // ---- API publica ----
  setFront(url) { this.setAttribute('front', url); }
  setBack(url) { this.setAttribute('back', url); }
  reset() {
    this._rotX = 0;
    this._rotY = 0;
    this._card.classList.add('settling');
    this._applyRotation();
  }

  // ---- Eventos de arrastre (mouse y touch, en toda la tarjeta) ----
  _pos(e) {
    if (e.touches && e.touches.length) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  _onDown(e) {
    this._dragging = true;
    this._card.classList.remove('settling');
    const p = this._pos(e);
    this._lastX = p.x;
    this._lastY = p.y;
  }

  _onMove(e) {
    if (!this._dragging) return;
    const p = this._pos(e);
    const dx = p.x - this._lastX;
    const dy = p.y - this._lastY;
    this._rotY += dx * 0.5;
    this._rotX -= dy * 0.5;
    // Sin limites: se puede girar libremente en las 4 direcciones (360 grados)
    this._lastX = p.x;
    this._lastY = p.y;
    this._applyRotation();
    if (e.cancelable) e.preventDefault();
  }

  _onUp() {
    this._dragging = false;
  }

  _applyRotation() {
    this._card.style.transform = `rotateX(${this._rotX}deg) rotateY(${this._rotY}deg)`;
  }

  // Construye una esquina redondeada real en 3D usando varios paneles
  // pequeños en forma de abanico que siguen la curva del borde.
  _buildCorner(cardEl, cx, cy, startDeg, endDeg, R, T, edgeColor, segments) {
    const step = (endDeg - startDeg) / segments;
    for (let i = 0; i < segments; i++) {
      const a0 = (startDeg + i * step) * Math.PI / 180;
      const a1 = (startDeg + (i + 1) * step) * Math.PI / 180;
      const p0x = cx + R * Math.cos(a0), p0y = cy + R * Math.sin(a0);
      const p1x = cx + R * Math.cos(a1), p1y = cy + R * Math.sin(a1);
      const mx = (p0x + p1x) / 2, my = (p0y + p1y) / 2;
      // +15% de largo para que no queden micro-huecos entre segmentos
      const L = Math.hypot(p1x - p0x, p1y - p0y) * 1.15;
      const phi = Math.atan2(p1y - p0y, p1x - p0x) * 180 / Math.PI;

      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = '0';
      div.style.top = '0';
      div.style.width = L + 'px';
      div.style.height = T + 'px';
      div.style.marginLeft = (-L / 2) + 'px';
      div.style.marginTop = (-T / 2) + 'px';
      div.style.background = edgeColor;
      // 1) rotateX(90) le da grosor (como los bordes rectos)
      // 2) rotateZ(phi) lo orienta en la direccion de la curva
      // 3) translate3d lo ubica en su posicion real dentro de la esquina
      div.style.transform =
        `translate3d(${mx}px,${my}px,0) rotateZ(${phi}deg) rotateX(90deg)`;
      cardEl.appendChild(div);
    }
  }

  _render() {
    const front = this.getAttribute('front') || '';
    const back = this.getAttribute('back') || '';
    const width = parseFloat(this.getAttribute('width')) || 260;
    const height = parseFloat(this.getAttribute('height')) || 380;
    const radius = parseFloat(this.getAttribute('radius')) || 18;
    const T = parseFloat(this.getAttribute('thickness')) || 3;
    const half = T / 2;
    const edgeColor = 'rgba(0,0,0,0.4)';
    const SEG = 6; // segmentos por esquina (mas = curva mas suave)

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        .scene {
          width: ${width}px;
          height: ${height}px;
          perspective: 1200px;
          cursor: grab;
          user-select: none;
          touch-action: none;
        }
        .scene:active { cursor: grabbing; }

        .card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          border-radius: ${radius}px;
          background: ${edgeColor};
        }
        .card.settling {
          transition: transform .6s cubic-bezier(.22,1,.36,1);
        }

        .face {
          position: absolute;
          inset: 0;
          border-radius: ${radius}px;
          backface-visibility: hidden;
          box-shadow: 0 20px 45px -10px rgba(0,0,0,.5);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-color: #1e1b2e;
        }
        .front { background-image: url('${front}'); transform: translateZ(${half}px); }
        .back  { background-image: url('${back}'); transform: rotateY(180deg) translateZ(${half}px); }

        .edge { position: absolute; background: ${edgeColor}; }
        .edge-top {
          left: ${radius}px; top: -${half}px;
          width: calc(100% - ${radius * 2}px); height: ${T}px;
          transform: rotateX(90deg);
        }
        .edge-bottom {
          left: ${radius}px; top: calc(100% - ${half}px);
          width: calc(100% - ${radius * 2}px); height: ${T}px;
          transform: rotateX(-90deg);
        }
        .edge-left {
          top: ${radius}px; left: -${half}px;
          width: ${T}px; height: calc(100% - ${radius * 2}px);
          transform: rotateY(-90deg);
        }
        .edge-right {
          top: ${radius}px; left: calc(100% - ${half}px);
          width: ${T}px; height: calc(100% - ${radius * 2}px);
          transform: rotateY(90deg);
        }
      </style>
      <div class="scene">
        <div class="card">
          <div class="face front"></div>
          <div class="face back"></div>
          <div class="edge edge-top"></div>
          <div class="edge edge-bottom"></div>
          <div class="edge edge-left"></div>
          <div class="edge edge-right"></div>
        </div>
      </div>
    `;

    const cardEl = this.shadowRoot.querySelector('.card');

    // Las 4 esquinas, cada una con su centro de curvatura y su rango de angulos
    this._buildCorner(cardEl, radius, radius, 180, 270, radius, T, edgeColor, SEG);
    this._buildCorner(cardEl, width - radius, radius, 270, 360, radius, T, edgeColor, SEG);
    this._buildCorner(cardEl, width - radius, height - radius, 0, 90, radius, T, edgeColor, SEG);
    this._buildCorner(cardEl, radius, height - radius, 90, 180, radius, T, edgeColor, SEG);

    if (this._card) this._applyRotation();
  }
}

customElements.define('card-3d', Card3D);
