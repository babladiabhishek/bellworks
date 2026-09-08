# Bellworks

A static kettlebell training app with exercise-specific YouTube tutorials, three workout sessions, a searchable movement library, set and weight tracking, a rest timer, and local progress.

## Run

```sh
python3 -m http.server 7331 --bind 127.0.0.1
```

Open http://127.0.0.1:7331/bellworks.html. No build step, API key or package installation is needed to run the app. Serve it over HTTP or HTTPS so YouTube receives the origin and referrer required for embedded playback. Opening the HTML directly from disk can prevent videos from playing.

## Movement studio

- All 18 movements have a specific demonstration or tutorial, with creator credit, video length and a direct YouTube link.
- Tap the preview to play inside the studio or workout dialog. YouTube provides seeking, playback speed, captions when available and fullscreen.
- Only the requested video loads a player. Changing exercises, leaving the view, closing workout mode or hiding the browser tab stops playback.
- The player uses YouTube’s privacy-enhanced domain. Thumbnails come from YouTube; fonts come from Google Fonts. Videos need an internet connection.
- If the IFrame API fails, a native embed still loads. Player errors show a direct-watch fallback. Workout instructions and tracking work independently of video availability.

The app no longer loads a 3D engine, models or synthetic movement animations. The hero kettlebell, muscle map and icons remain code-native SVG.

## Files

- `bellworks.html` — app structure.
- `bellworks.css` and `video-studio.css` — responsive interface and video studio, including dark theme.
- `bellworks.js` — program data, navigation, workout state, timer and progress.
- `exercise-videos.js` — explicit exercise-to-video mapping, verified titles, channel attribution and duration.
- `youtube-player.js` — click-to-play embeds, playback lifecycle and error handling.
- [VIDEO-SOURCES.md](VIDEO-SOURCES.md) — source links and verification notes.

Existing `bw.done.*`, `bw.wt.*`, and `bw.tab` browser data is preserved. `bw.sets.*` tracks individual sets. Reset clears only the current session’s sets, retains weights, and offers Undo. Progress reflects the current device’s session log; it is not a historical or cloud account.

## Verification

Browser checks use Playwright. With Playwright installed and the local server running:

```sh
node scripts/check-ui.cjs
node scripts/check-videos.cjs
```

Set `PLAYWRIGHT_MODULE` to an existing Playwright installation if it is not in the module search path. `BELLWORKS_URL` can target another HTTP preview. The UI checks use controlled player responses to test navigation, playback cleanup, error handling, workout logging, persistence, timers, keyboard controls, themes and responsive widths. The separate live video check verifies actual YouTube playback and reports unavailable videos.

All 18 selected videos played in the app during the September 7, 2026 check; see [the recorded results](scripts/video-verification.json). YouTube availability and embedding settings can change.
