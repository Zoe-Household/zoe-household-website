import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./schemaTypes";
import { structure } from "./structure";

const projectId = "lmzgn85t";
const dataset = "production";
const apiVersion = "2026-10-12";

export default defineConfig({
  name: "zoe-household",
  title: "Zoe Household",
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
