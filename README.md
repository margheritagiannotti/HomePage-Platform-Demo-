# Luxia – Demo piattaforma

Prototipo cliccabile della home della piattaforma Luxia: agenti, LIA, progetti su misura, piano e consumi, Credit Agent.

**È una demo:** dati, numeri e prezzi sono d’esempio e non sono collegati a nessun sistema reale.

## Come aprirla

- **In locale:** scarica la cartella e apri `index.html` nel browser. Non serve installare nulla.
- **Online con GitHub Pages:** nel repository vai su *Settings → Pages*, scegli *Deploy from a branch*, branch `main`, cartella `/ (root)` e salva. Dopo un paio di minuti la demo è disponibile su `https://<utente-o-organizzazione>.github.io/<nome-repository>/`.

## Cosa contiene

| File | A cosa serve |
|---|---|
| `index.html` | La demo: struttura delle pagine, testi, stile e logica (stato, agenti, LIA, consumi) |
| `runtime.js` | Piccolo motore che legge il modello della pagina e aggiorna lo schermo quando cambia lo stato |
| `.nojekyll` | Dice a GitHub Pages di pubblicare i file così come sono |

## Cosa si può provare

- **Home:** passa sopra i cerchi degli agenti per vederli girare, cliccali per la demo, crea più agenti dello stesso tipo.
- **LIA:** scrivi nell’editor e guarda l’anteprima dell’agente aggiornarsi.
- **Progetti su misura:** idee di automazione e modulo di contatto precompilato.
- **Piano e consumi:** contratto, consumabili (crediti, pratiche, minuti di voce, conversazioni WhatsApp) e limiti di spesa.
- **Credit Agent:** pagina prodotto con dossier animato.

## Note

- I font (Nunito Sans, JetBrains Mono) arrivano da Google Fonts: senza connessione la pagina usa i font di sistema.
- Segnaposti da completare: prezzo delle conversazioni WhatsApp, data di rinnovo e referente nel contratto, licenza di LIA.
