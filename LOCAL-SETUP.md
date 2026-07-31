# Zoe Household local preview

## First-time setup

1. Install the current Node.js LTS release from <https://nodejs.org/>.
2. Open PowerShell and run:

   ```powershell
   corepack enable
   ```

3. Double-click `start-local.cmd` in this folder.

The launcher installs dependencies the first time and starts the website. Keep
its terminal window open while using the preview.

## Open the site

- On this computer: <http://localhost:3000>
- On a phone connected to the same Wi-Fi: use the `Network` address printed in
  the launcher window, such as `http://10.0.0.92:3000`.

If Windows asks whether Node.js may communicate on private networks, allow
private-network access. Do not allow public-network access unless you
specifically need it.

## Stop the site

Focus the launcher window and press `Ctrl+C`, then confirm if Windows asks.

## Publish the source to GitHub

Create an empty GitHub repository without a README or `.gitignore`. Then open
PowerShell in this project folder and run:

```powershell
git init
git add .
git commit -m "Build Zoe Household multi-page prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

For later updates:

```powershell
git add .
git commit -m "Describe the website update"
git push
```

GitHub stores the source but does not run a Next.js site by itself. To open the
site from a phone when it is not on the same Wi-Fi as this computer, connect the
GitHub repository to a Next.js host such as Vercel and use the HTTPS preview URL
it provides.

