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

## Déploiement sur GitHub Pages

Le site est prévu pour le domaine **`https://mysubis.app/`** (les liens légaux de l'app pointent déjà vers `privacy.html` et `support.html`).

1. Copie le **contenu** de ce dossier à la **racine** du dépôt GitHub Pages.
2. Dépôt → **Settings → Pages** → Source = branche `main`, dossier `/ (root)`.
3. **Custom domain** = `mysubis.app` (un fichier `CNAME` à la racine fait la même chose), puis coche « Enforce HTTPS ».
4. Chez ton registrar : enregistrements `A` vers les IP GitHub Pages (`185.199.108–111.153`) pour l'apex, et un `CNAME` `www` → `<compte>.github.io`.
5. Attends 1-2 min (plus la propagation DNS) : le site est en ligne.

> Astuce : tu peux aussi servir depuis un dossier `/docs`. Dans ce cas, mets les fichiers dans `docs/` et choisis « /docs » comme source Pages.

## À personnaliser avant publication

- **E-mail de contact** : `contact@mysubis.app` (dans `privacy.html` et `support.html`). ✅
- **Lien App Store** : https://apps.apple.com/fr/app/mysubis-suivi-dabonnements/id6780065688 (boutons de `index.html` + JSON-LD). ✅
- **Image de partage** (`og-image.png`) : ajoute une image 1200×630 à la racine pour un joli aperçu sur les réseaux (référencée dans les balises Open Graph). Optionnel.

## SEO déjà en place

Balises `title`/`description` uniques par page, Open Graph + Twitter Cards, `canonical`, données structurées JSON-LD (SoftwareApplication + FAQPage), `sitemap.xml`, `robots.txt`, HTML sémantique et responsive.
