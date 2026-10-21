import type { SchemaTypeDefinition } from "sanity";
import { campusType } from "./documents/campus";
import { eventType } from "./documents/event";
import { submissionType } from "./documents/submission";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [eventType, campusType, submissionType],
};
