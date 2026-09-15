const fs = require("fs");
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// React Native CSS Interop (NativeWind's engine) resolves `global.css` to an
// on-disk cache file and writes the generated CSS into it *while* the bundle is
// being built. Its setup pre-creates the cache entries for the native platforms
// but not for web, so on a clean checkout — CI, or a Vercel build —
// `.cache/web.css` only appears part-way through bundling. Metro has already
// scanned the filesystem by then, so it never watches the new file and the
// export dies with:
//   Failed to get the SHA-1 for: .../react-native-css-interop/.cache/web.css
// This config is evaluated before Metro scans, so creating the file here makes
// a cold build behave exactly like a warm one. The generated CSS is written
// over this placeholder during the bundle, so the placeholder never ships.
const cssInteropCache = path.join(
  __dirname,
  "node_modules/react-native-css-interop/.cache"
);
fs.mkdirSync(cssInteropCache, { recursive: true });
const cssInteropWebCss = path.join(cssInteropCache, "web.css");
if (!fs.existsSync(cssInteropWebCss)) {
  fs.writeFileSync(cssInteropWebCss, "");
}

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
