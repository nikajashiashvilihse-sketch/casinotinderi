# CasinoSwipe — Swipe to Find Your Perfect Casino

CasinoSwipe is a high-performance full-stack web application designed with Tinder-style swipe mechanics matching players with verified, safe casino operations available in their country. 

---

## 🚫 Why Do I See a Blank/White Page?

If you are experiencing a blank white screen when opening the application, it is caused by one of two common environment behaviors:

### 1. Opening `index.html` directly via the File Explorer (Double-Clicking)
* **The Cause:** When opening files via the file protocol (`file:///C:/.../index.html`), modern web browsers strictly block JavaScript ES modules (`type="module"`) from running due to local CORS security restrictions.
* **The Solution:** You must view the application through a local web server (detailed in the **How to Run Locally** section below).

### 2. Hosting the Raw Source Code on GitHub Pages
* **The Cause:** The root `/index.html` file in the source repository points to `/src/main.tsx`. Web browsers cannot read or compile TS/TSX files natively. 
* **The Solution:** You must deploy the compiled application bundle inside the generated `dist/` directory, rather than the raw workspace root.

---

## 🚀 How to Run the Application Locally

To test the application on your computer, please run a lightweight server instead of opening the file directly.

### Install Node.js
Ensure you have [Node.js](https://nodejs.org/) installed on your system.

### Steps to Run:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build the production-ready build:**
   ```bash
   npm run build
   ```
   This will compile the TSX code, bundles CSS using Tailwind, and generates highly-optimized static files in the `/dist` directory.

4. **Serve the production build locally:**
   ```bash
   npx serve dist
   ```

---

## 🌍 How to Deploy on GitHub Pages (Successfully!)

We have already configured a secure **GitHub Actions Workflow** in your repository to handle building and deploying automatically! Follow these steps to activate it:

### Option A: Automatic Build via GitHub Actions (Recommended)

1. Push this codebase to your GitHub repository (e.g., `main` or `master` branch).
2. Go to your repository on **GitHub** in your web browser.
3. Click on the **Settings** tab at the top.
4. On the left sidebar menu, look under the "Code and automation" section and click on **Pages**.
5. Under **Build and deployment** -> **Source**, click the dropdown and change it from *Deploy from a branch* to **GitHub Actions**.
6. That's it! GitHub Actions will now automatically intercept your pushes, build the application properly (`npm run build`), and host the optimized `dist` folder on your Pages subdomain with zero manual updates.

### Option B: Manual GitHub Pages Deployment (Deploying `dist/`)

If you prefer to deploy from branches, remember you must deploy the **contents of the `/dist` folder**, not the root folder:

1. Install the deployment tool:
   ```bash
   npm install -D gh-pages
   ```
2. Add a deploy script to your `package.json` file inside `"scripts"`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Deploy directly via command line:
   ```bash
   npm run deploy
   ```
