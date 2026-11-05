# Treningsbok – notater for Claude

## Utviklingslogg
- Hver gang appen endres, legg til en linje i `CHANGELOG.md` i samme commit.
- Skriv på norsk, under dagens dato (nyeste dag øverst), gruppert etter tema, i samme stil som resten av loggen.
- Beskriv hva brukeren merker, ikke tekniske detaljer.

## Filer
- `index.html`, `style.css`, `app.js` (appen), `anim.js` (3D-/strekfigur-animasjoner), `mer.js` (Mer-fanen, registreres via `window.TBX`), `firebase-config.js` (innlogging).
- `sw.js` + `manifest.webmanifest` + `icons/` gjør appen installerbar og frakoblet. Nye filer appen trenger må legges i `CORE`-listen i `sw.js`.
- Øk versjonsnummeret (`?v=`) på filene i `index.html` når de endres, så nettleseren henter ny versjon.
