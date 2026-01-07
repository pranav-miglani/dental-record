# Web App Setup

This React Native app can also run as a web application using React Native Web.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start web development server
npm run web
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build:web
```

The built files will be in the `build/` directory, ready to be deployed to any static hosting service.

## Deployment Options

### Option 1: Static Hosting (Recommended)

Deploy the `build/` folder to:
- **Netlify**: Drag and drop the build folder
- **Vercel**: Connect your repo and set build command to `npm run build:web`
- **AWS S3 + CloudFront**: Upload build folder to S3 bucket
- **GitHub Pages**: Use GitHub Actions to deploy

### Option 2: Server-Side Rendering (Future)

For better SEO and performance, consider:
- Next.js (with React Native Web)
- Remix
- Custom Express server

## Environment Variables

Create a `.env` file in the `mobile/` directory:

```env
REACT_APP_API_BASE_URL=https://your-api-gateway-url.amazonaws.com
REACT_APP_API_VERSION=v1
REACT_APP_NODE_ENV=production
```

## Web-Specific Features

- **Responsive Design**: Works on desktop, tablet, and mobile browsers
- **PWA Support**: Can be installed as a Progressive Web App
- **LocalStorage**: Uses browser localStorage instead of AsyncStorage
- **Browser Navigation**: Uses browser history API
- **Keyboard Shortcuts**: (Future enhancement)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

## Performance

- Code splitting for faster initial load
- Lazy loading of routes
- Image optimization
- Bundle size optimization

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules build
npm install
npm run build:web
```

### Port Already in Use

```bash
# Use a different port
PORT=3001 npm run web
```

### Module Not Found

Make sure all React Native Web dependencies are installed:
```bash
npm install react-native-web react-dom
```

## CI/CD Integration

The web build is automatically included in the CI/CD pipeline. See `.github/workflows/mobile-build.yml` for details.

