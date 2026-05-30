# VeloCPH — Copenhagen Bike Tour Generator

AI-powered custom cycling routes through Copenhagen.

## Deploy to GitHub Pages in 5 steps

### 1. Create a GitHub repo
Go to github.com → New repository → name it `velocph` → Create

### 2. Push this code
```bash
cd velocph
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/velocph.git
git push -u origin main
```

### 3. Install dependencies and deploy
```bash
npm install
npm run deploy
```

This builds the app and pushes the `dist` folder to a `gh-pages` branch automatically.

### 4. Enable GitHub Pages
- Go to your repo on GitHub
- Settings → Pages
- Source: Deploy from branch
- Branch: `gh-pages` / `root`
- Save

### 5. Your URL
After ~60 seconds your app is live at:
`https://YOUR_USERNAME.github.io/velocph/`

---

## Local development
```bash
npm install
npm run dev
```

## Notes
- Map: OpenStreetMap (free, no API key)
- Routing: OSRM (free, no API key)  
- Weather: Open-Meteo (free, no API key)
- AI text: Anthropic API (key handled by Claude.ai in demo mode)
- For production: add your own Anthropic API key as an environment variable
