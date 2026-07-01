# a little something for Soumii 🎀

A small interactive multi-page website — flip through it like a handmade booklet.

## Before you deploy — 3 things to fill in

1. **Her birthday** — open `countdown.js`, edit the line:
   ```js
   const BIRTHDAY = new Date("2026-09-01T00:00:00");
   ```
   Replace with her real birthday (format: `"YYYY-MM-DDTHH:MM:SS"`).

2. **Photos** — drop your images into:
   - `assets/photos/` for the main album (then edit `photos.js` to point at the real filenames + write real captions/dates)
   - `assets/photos/ugly/` for the secret gallery (edit `ugly-photos.js` the same way)
   - Any number of photos works — the layout wraps automatically.

3. **Song** — drop an mp3 at `assets/music/song.mp3` (must be named exactly that, or update the `src` in `index.html`'s `<audio>` tag). If you skip this, Page 2 still works and just shows a friendly "add your song here" placeholder instead of breaking.

Everything else (the 8 letters, the facts, the final message) is already filled in with your real content — open `letters.js`, `facts.js`, or `index.html` (Page 8) if you ever want to tweak wording.

## Run it locally

No build step needed — it's plain HTML/CSS/JS. Just open `index.html` in a browser, or serve it locally so paths/audio behave the same way they will online:

```bash
# from inside this folder
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy for free — GitHub → Vercel

1. **Create a GitHub repo**
   ```bash
   cd soumii-site
   git init
   git add .
   git commit -m "a little something for Soumii"
   ```
   Create a new empty repo on github.com (no README/gitignore), then:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) → sign in with GitHub
   - Click **Add New → Project**
   - Select your repo
   - Framework preset: **Other** (it's a static site, no build command needed)
   - Click **Deploy**
   - You'll get a live URL like `soumii-something.vercel.app` in about a minute

3. **Updating later** — any time you `git push` to `main`, Vercel redeploys automatically. So to swap in real photos/song later:
   ```bash
   # add your files to assets/, edit photos.js etc.
   git add .
   git commit -m "add real photos and song"
   git push
   ```

## Editing in VS Code

Just open the `soumii-site` folder in VS Code (`code .` from inside it, or File → Open Folder). All the editable content lives in these files:

| File | What's in it |
|---|---|
| `countdown.js` | The birthday date |
| `photos.js` / `ugly-photos.js` | Photo album entries |
| `facts.js` | The flip-card facts |
| `letters.js` | The 8 letters |
| `index.html` (Page 8, near the bottom) | The final message |
| `styles.css` | Colors, fonts, spacing — the whole look |

## File structure

```
soumii-site/
├── index.html          all 8 pages
├── styles.css           design system
├── main.js               navigation + page interactions
├── countdown.js            birthday countdown + cake logic
├── photos.js                 main album
├── ugly-photos.js              secret album
├── facts.js                      flip-card facts
├── letters.js                     the 8 letters
├── game.js                          Catch the Ramen
├── music-player.js                     global audio player
├── assets/
│   ├── photos/                           put main album images here
│   ├── photos/ugly/                        put secret gallery images here
│   └── music/song.mp3                        put your song here
└── README.md
```
