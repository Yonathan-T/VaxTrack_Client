# VaxTrack Setup Guide - Ubuntu & VS Code

This guide will walk you through setting up VaxTrack on Ubuntu Linux with VS Code and deploying it to Render.

---

## Prerequisites

Before you begin, ensure you have the following installed on your Ubuntu system:

### 1. Install Node.js and npm

```bash
# Update package list
sudo apt update

# Install Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2. Install Git

```bash
sudo apt install git
git --version
```

### 3. Install VS Code

```bash
# Download and install VS Code
sudo snap install --classic code

# Or use apt:
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install code
```

---

## Part 1: Setting Up VaxTrack Locally

### Step 1: Download the Project

If you downloaded the project as a ZIP file from v0:

```bash
# Navigate to Downloads
cd ~/Downloads

# Extract the ZIP file
unzip vaxtrack-project.zip

# Move to a better location
mv vaxtrack-project ~/Projects/vaxtrack
cd ~/Projects/vaxtrack
```

Or if you have it in a GitHub repository:

```bash
cd ~/Projects
git clone https://github.com/your-username/vaxtrack.git
cd vaxtrack
```

### Step 2: Install Dependencies

```bash
# Install all required npm packages
npm install

# This will install Next.js, React, Tailwind CSS, and all other dependencies
```

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Create the file
touch .env.local

# Open in VS Code
code .env.local
```

Add the following content to `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://vaxtrackapi.onrender.com/api

# Optional: For local backend development
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Step 4: Open in VS Code

```bash
# Open the entire project in VS Code
code .
```

### Step 5: Install Recommended VS Code Extensions

Once VS Code opens, install these extensions:

1. **ES7+ React/Redux/React-Native snippets** - dsznajder.es7-react-js-snippets
2. **Tailwind CSS IntelliSense** - bradlc.vscode-tailwindcss
3. **Prettier - Code formatter** - esbenp.prettier-vscode
4. **ESLint** - dbaeumer.vscode-eslint
5. **Auto Rename Tag** - formulahendry.auto-rename-tag

You can install them via the Extensions panel (Ctrl+Shift+X) or run:

```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension formulahendry.auto-rename-tag
```

### Step 6: Run the Development Server

```bash
# Start the Next.js development server
npm run dev
```

The application will start at `http://localhost:3000`

Open your browser and navigate to:
- **Homepage**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard (after login)

### Step 7: Test Credentials

Use these test credentials to log in:

**Healthcare Worker**
- Email: `healthcare@gmail.com`
- Password: `Healthcare123!`

**Administrator**
- Email: `admin@vaxtrack.et`
- Password: `Admin123!`

**Parent/Guardian**
- Email: `parent@gmail.com`
- Password: `Parent123!`

---

## Part 2: Building for Production

### Step 1: Create Production Build

```bash
# Build the application
npm run build

# Test the production build locally
npm run start
```

### Step 2: Verify Build Output

Check the `.next` folder to ensure all pages compiled successfully:

```bash
ls -la .next
```

---

## Part 3: Deploying to Render

Render is a modern cloud platform that makes deployment easy. Follow these steps:

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):

```bash
git init
git add .
git commit -m "Initial commit for VaxTrack"
```

2. **Push to GitHub**:

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/your-username/vaxtrack.git
git branch -M main
git push -u origin main
```

### Step 2: Create a Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended for easy integration)
4. Authorize Render to access your GitHub repositories

### Step 3: Deploy to Render

#### Option 1: Deploy from Dashboard (Easiest)

1. **Click "New +"** in the top right
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Select your `vaxtrack` repository
   - Click "Connect"

4. **Configure the service:**
   - **Name**: `vaxtrack` (or your preferred name)
   - **Region**: Choose closest to Ethiopia (e.g., Frankfurt or Singapore)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

5. **Add Environment Variables:**

   Click "Advanced" and add these:

   ```
   NEXT_PUBLIC_API_URL=https://vaxtrackapi.onrender.com/api
   NODE_VERSION=20.11.0
   ```

6. **Click "Create Web Service"**

Render will now:
- Clone your repository
- Install dependencies
- Build your Next.js app
- Deploy it to a public URL (e.g., `https://vaxtrack.onrender.com`)

### Step 4: Configure Custom Domain (Optional)

1. Go to your service's **Settings** tab
2. Scroll to **Custom Domains**
3. Add your domain (e.g., `vaxtrack.et`)
4. Follow the DNS configuration instructions provided by Render

---

## Part 4: Continuous Deployment

Render automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update vaccination schedule"
git push origin main

# Render will automatically detect the push and redeploy
```

---

## Troubleshooting

### Issue: "Failed to fetch" errors

**Solution 1: Check API URL**
```bash
# Ensure .env.local exists and has the correct API URL
cat .env.local
```

**Solution 2: CORS Issues**
The backend API must allow requests from your frontend domain. Contact the backend team to whitelist:
- `http://localhost:3000` (for local dev)
- `https://vaxtrack.onrender.com` (for production)
- `https://v0.app` (for v0 preview)

### Issue: Port 3000 already in use

```bash
# Find the process using port 3000
sudo lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

### Issue: Permission errors during npm install

```bash
# Fix npm permissions
sudo chown -R $USER:$(id -gn $USER) ~/.config
sudo chown -R $USER:$(id -gn $USER) ~/.npm
```

### Issue: Build fails on Render

**Check these:**
1. Ensure `package.json` has correct `build` and `start` scripts
2. Verify Node version matches (20.x)
3. Check Render build logs for specific errors
4. Ensure all dependencies are in `dependencies`, not `devDependencies`

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Check for code issues

# Git Commands
git status           # Check file changes
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push             # Push to GitHub

# VS Code
code .               # Open current directory
code file.tsx        # Open specific file
Ctrl+Shift+P         # Command palette
Ctrl+`               # Toggle terminal
```

---

## Best Practices

1. **Always test locally before deploying**
   ```bash
   npm run build && npm start
   ```

2. **Use environment variables for configuration**
   - Never hardcode API URLs or secrets
   - Use `.env.local` for local dev
   - Use Render's Environment Variables for production

3. **Keep dependencies updated**
   ```bash
   npm outdated        # Check for updates
   npm update          # Update packages
   ```

4. **Monitor production logs**
   - Check Render's Logs tab for errors
   - Set up error tracking (e.g., Sentry)

5. **Regular backups**
   - Commit changes frequently
   - Keep GitHub repository updated

---

## Next Steps

1. **Set up a staging environment** on Render for testing
2. **Configure monitoring** with Render's built-in metrics
3. **Set up automated testing** with GitHub Actions
4. **Enable automatic HTTPS** (Render provides this by default)
5. **Configure health checks** in Render settings

---

## Support

For issues specific to:
- **VaxTrack Application**: Check the GitHub Issues
- **Render Deployment**: Visit https://render.com/docs
- **Next.js**: Visit https://nextjs.org/docs
- **Ubuntu/Linux**: Visit https://askubuntu.com

---

## Summary

You now have a complete guide to:
- Install Node.js, Git, and VS Code on Ubuntu
- Set up and run VaxTrack locally
- Deploy to Render with automatic continuous deployment
- Troubleshoot common issues

Your VaxTrack application is now ready for production use!
