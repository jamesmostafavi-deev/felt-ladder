# Felt Ladder

A poker training app for No-Limit Texas Hold'em. It installs on your phone or computer, works offline, and saves your progress on the device.

## Put it online (one time, free, about 2 minutes)

The app needs an https address before a phone will install it.

1. Unzip `felt-ladder.zip`.
2. Go to https://app.netlify.com/drop and drag the `felt-ladder` folder onto the page.
3. Netlify gives you an address like `https://something.netlify.app`. Create a free account when asked so the site doesn't expire.

GitHub Pages or Cloudflare Pages also work. Upload the folder contents as a static site.

## Install it

- iPhone: open the address in Safari, tap Share, then Add to Home Screen.
- Android: open it in Chrome, tap the menu, then Install app.
- Mac or PC: open it in Chrome or Edge and click the install icon in the address bar.

## Try it on a computer without hosting

From inside the folder, run `python3 -m http.server 8000`, then open http://localhost:8000.

## Your data

Progress, sessions and player notes stay on the device you use. To move them to another device, use Settings, then Export backup, then Import backup on the other device.

## Files

- `data.js`: lessons, quizzes, ranges and sources. Edit this to change content.
- `app.js`: the app logic.
- `table.js`: the practice table (dealing, betting, bots, hand evaluation, coach).
- `styles.css`: the look.
- `sw.js`: offline support. If you edit files, change `VERSION` in this file so installed copies update.
