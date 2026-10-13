# Site MySubis

Site vitrine statique (HTML/CSS, sans build) — pensé pour **GitHub Pages** (`www.mysubis.app`). Mis à jour pour **MySubis 2.0** (oct. 2026) : DA noir & blanc + accent menthe, nouveau logo « m orbital ».

```
./
├── index.html      Landing v2 (hero, nouveautés 2.0, galerie, fonctionnalités, offres, FAQ)
├── privacy.html    Politique de confidentialité (FR + EN)
├── support.html    Support / FAQ (FR + EN)
├── styles.css      Styles partagés (thème clair + sombre)
├── script.js       Bascule thème + langue (persistées)
├── img/            logo.svg, apple-touch-icon.png, icon-512.png, og-{fr,en}.jpg (partage 1200×630)
│   └── screens/{fr,en}/  Captures de l'app (JPEG 600 px) — régénérées depuis store-screenshots/raw de l'app
├── robots.txt      SEO
└── sitemap.xml     SEO
```

## Bilingue & thème

- **Langue** FR/EN : bouton en haut à droite. Le choix est mémorisé (localStorage) et détecte la langue du navigateur au 1er chargement. Les deux langues sont présentes dans le HTML (bon pour le SEO).
- **Thème** clair/sombre : bouton lune/soleil. Suit la préférence système par défaut, puis mémorise le choix manuel.
