# +Cerca — Landing

Landing estática para +Cerca. Single page + página 404, bilingüe (ES/EN), sin build step.

## Stack

- HTML + CSS + JS vanilla
- Web Component `card3d.js` para la credencial 3D
- Carousel con scroll-snap nativo (cero libs)
- Google Fonts (Space Grotesk · Inter · JetBrains Mono)

## Cómo correrlo

```bash
python3 -m http.server 8000
# o
npx serve .
```

Luego abre `http://localhost:8000`. La 404 se ve en `http://localhost:8000/404.html`.

## Estructura

```
.
├── index.html            # landing principal
├── 404.html              # página de error
├── styles.css            # design tokens + estilos
├── i18n.js               # strings ES + EN, switcher con fade
├── card3d.js             # Web Component tarjeta 3D
├── carousel.js           # lógica prev/next + scroll-snap
├── README.md
└── assets/
    ├── Front2.png        # frente de la credencial
    ├── back.png          # reverso de la credencial
    ├── logo.png          # logo +CERCA
    ├── favicon.ico, favicon-16.png, favicon-32.png, apple-touch-icon.png
    └── gallery/          # 16 fotos en terreno (vertical 3:4)
```

## Pendiente

- `assets/og-cover.jpg` (1200×630) — para previews en redes
- Email real en `index.html` (buscar `contacto@mascerca.cl`)
- Configurar el servidor para servir `404.html` en errores 404

## Bilingüe

- Default: `es` — persistencia en `localStorage`
- Cambio con transición fade de 180ms
- Para cambiar el default, editar `getLang` en `i18n.js`
