# SignVerse (React + Vite)

    npm install
    npm run dev          # http://localhost:5173

Pages: `#/` main · `#/register` · `#/meet` · `#/lobby` · `#/call`
Open any page directly while testing with `?dev`  e.g. `http://localhost:5173/?dev#/call`
Fake captions to preview the UI: add `?demo`  e.g. `http://localhost:5173/?demo`

## Connect your OpenCV code
1. Put it in `detect_sign()` in `server_example.py`, run `python server_example.py`.
2. In `src/lib/signverse.js` change `mode: 'off'` to `mode: 'http'`.

## Where things are
- `src/pages/`       Landing (page 1+2), Meet (3), Lobby (4), Call (5)
- `src/components/`  Aurora, FloatingHands, BlurText, ShinyText, SpotlightCard, Magnet, TiltCard, ClickSpark ...
- `src/lib/signverse.js`  detection bridge + login/meeting stubs
- `src/lib/speech.js`     Speak aloud (browser text-to-speech)
- `src/styles.css`        all colours are CSS variables at the top
- `public/assets/`        logo + hands
