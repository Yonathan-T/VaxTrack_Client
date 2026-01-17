# VaxTrack Quick Start Guide

Get up and running in 5 minutes!

## For Local Development (Ubuntu)

```bash
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Navigate to project
cd ~/Downloads/vaxtrack-project  # Or wherever you extracted it

# 3. Install dependencies
npm install

# 4. Create environment file
echo "NEXT_PUBLIC_API_URL=https://vaxtrackapi.onrender.com/api" > .env.local

# 5. Run the app
npm run dev
```

Open http://localhost:3000 in your browser!

**Test Login:**
- Email: `healthcare@gmail.com`
- Password: `Healthcare123!`

---

## For Deploying to Render

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Deploy VaxTrack"
git remote add origin https://github.com/YOUR_USERNAME/vaxtrack.git
git push -u origin main

# 2. Go to https://render.com
# 3. Click "New +" → "Web Service"
# 4. Connect your GitHub repo
# 5. Configure:
#    - Build: npm install && npm run build
#    - Start: npm start
#    - Add env var: NEXT_PUBLIC_API_URL=https://vaxtrackapi.onrender.com/api
# 6. Click "Create Web Service"

# Done! Your app will be live at https://your-app.onrender.com
```

---

## Troubleshooting

**"Failed to fetch"** → Check that `.env.local` has the correct API URL

**Port 3000 in use** → Run `npm run dev -- -p 3001` to use port 3001

**Permission errors** → Run `sudo chown -R $USER ~/.npm`

For detailed instructions, see `SETUP_GUIDE.md`
