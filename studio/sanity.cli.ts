import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "lmzgn85t",
    dataset: "production",
  },
  studioHost: "zoehousehold",
  deployment: {
    appId: "ivplov8s33neu8tastydlpck",
  },
  // Studio runs on Vite; this keeps the Studio on auto-updating runtime.
  autoUpdates: true,
  // Generate TypeScript types from the schema + the Next.js app's GROQ queries.
  typegen: {
    enabled: true,
    path: "../{app,components,lib,sanity}/**/*.{ts,tsx,js,jsx}",
    schema: "schema.json",
    generates: "../sanity.types.ts",
    // The frontend uses next-sanity (@sanity/client is only transitive), so the
    // module-augmentation overload can't resolve during `next build`. Our fetches
    // use explicit generics, so we don't need the overload.
    overloadClientMethods: false,
  },
});
