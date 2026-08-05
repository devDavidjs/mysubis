# Site MySubis

Site vitrine statique (HTML/CSS, sans build) — pensé pour **GitHub Pages**.

```
site/
├── index.html      Landing (mockup, features, comparatif, FAQ)
├── privacy.html    Politique de confidentialité (FR + EN)
├── support.html    Support / FAQ (FR + EN)
├── styles.css      Styles partagés (thème clair + sombre)
├── script.js       Bascule thème + langue (persistées)
├── img/            Screenshots (screenshot_fr.PNG, screenshot_en.PNG)
├── robots.txt      SEO
└── sitemap.xml     SEO
```

## Bilingue & thème

- **Langue** FR/EN : bouton en haut à droite. Le choix est mémorisé (localStorage) et détecte la langue du navigateur au 1er chargement. Les deux langues sont présentes dans le HTML (bon pour le SEO).
- **Thème** clair/sombre : bouton lune/soleil. Suit la préférence système par défaut, puis mémorise le choix manuel.
