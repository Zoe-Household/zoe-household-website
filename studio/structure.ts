import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Zoe Household")
    .items([
      S.documentTypeListItem("event").title("Events"),
      S.documentTypeListItem("campus").title("Campuses"),
    ]);
