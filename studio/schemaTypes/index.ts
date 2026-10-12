import type { SchemaTypeDefinition } from "sanity";
import { campusType } from "./documents/campus";
import { eventType } from "./documents/event";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [eventType, campusType],
};
