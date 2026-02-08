# Setup Guide for Elbot Card

This guide will help you set up the development environment and publish your card to GitHub/HACS.

## Prerequisites

- Git installed
- Node.js 18+ installed
- GitHub account
- Home Assistant instance for testing

## Step 1: Initial Setup

1. **Create GitHub Repository**
   ```bash
   # Create a new repository on GitHub named "elbot-card"
   # Don't initialize with README (we already have one)
   ```

2. **Initialize Local Repository**
   ```bash
   cd elbot-card-repo
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/elbot-card.git
   git push -u origin main
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

## Step 2: Build the Card

```bash
# Build once
npm run build

# Or watch for changes during development
npm run watch
```

This will create `dist/elbot-card.js`

## Step 3: Test Locally

1. Copy `dist/elbot-card.js` to your Home Assistant instance:
   ```bash
   # On your Home Assistant machine
   mkdir -p /config/www/elbot-card
   # Copy dist/elbot-card.js to /config/www/elbot-card/
   ```

2. Add to your Lovelace resources in `configuration.yaml`:
   ```yaml
   lovelace:
     resources:
       - url: /local/elbot-card/elbot-card.js
         type: module
   ```

3. Restart Home Assistant

4. Add the card to a dashboard:
   ```yaml
   type: custom:elbot-card
   entity: sensor.elbot_recommendation_status
   cheapest_entity: sensor.cheapest_upcoming_prices
   ```

## Step 4: Create First Release

1. **Update package.json**
   - Replace `YOUR_USERNAME` with your GitHub username
   - Update author name

2. **Update README.md**
   - Replace all `YOUR_USERNAME` with your GitHub username
   - Add screenshots (optional but recommended)
   - Update any other placeholders

3. **Commit changes**
   ```bash
   git add .
   git commit -m "Update repository links and author info"
   git push
   ```

4. **Create release**
   ```bash
   # Using the release script
   ./scripts/release.sh patch
   
   # Or manually
   git tag v1.0.0
   git push origin v1.0.0
   ```

   This will trigger GitHub Actions to:
   - Build the card
   - Create a GitHub release
   - Attach the built files

## Step 5: Add to HACS

### Option A: Custom Repository (Easier)

Users can add your repository as a custom HACS repository:

1. Open Home Assistant
2. Go to HACS → Frontend
3. Click three dots → Custom repositories
4. Add `https://github.com/YOUR_USERNAME/elbot-card`
5. Select category: "Lovelace"
6. Click "Add"

### Option B: Submit to HACS Default (Official)

1. Ensure your repo meets HACS requirements:
   - Has a `hacs.json` file ✅
   - Has releases ✅
   - Has a `README.md` ✅
   - Has a `LICENSE` ✅

2. Fork https://github.com/hacs/default

3. Edit the `plugins` file and add:
   ```json
   {
     "name": "Elbot Card",
     "description": "Custom electricity recommendation card",
     "repository": "YOUR_USERNAME/elbot-card"
   }
   ```

4. Create a Pull Request

5. Wait for HACS team approval (usually a few days)

## Step 6: Customize Your Card

Now you can customize the card to your needs:

1. Edit `src/elbot-card.js` to modify functionality
2. Update styles, colors, or icons
3. Add new features
4. Test locally with `npm run watch`
5. Create new releases with `./scripts/release.sh`

## Development Workflow

```bash
# Daily development
npm run watch          # Auto-rebuild on changes
npm run lint           # Check code quality
npm run format         # Format code

# Before committing
npm run lint           # Ensure no errors
npm run build          # Test production build
git add .
git commit -m "Description of changes"
git push

# Creating a release
./scripts/release.sh patch   # Bug fixes (1.0.0 -> 1.0.1)
./scripts/release.sh minor   # New features (1.0.1 -> 1.1.0)
./scripts/release.sh major   # Breaking changes (1.1.0 -> 2.0.0)
```

## Troubleshooting

### Build fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Card not loading in Home Assistant
1. Check browser console for errors (F12)
2. Verify resource URL in configuration.yaml
3. Clear browser cache
4. Restart Home Assistant

### HACS not detecting updates
- Ensure you're creating proper releases with tags
- Wait up to 30 minutes for HACS to detect new releases
- Check that `hacs.json` has correct `filename`

## Next Steps

1. Add screenshots to README.md
2. Create example configurations
3. Add more features
4. Engage with the community
5. Star the original repos you used for inspiration!

## Support

- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share ideas
- Pull Requests: Contribute improvements

Happy coding! 🚀
