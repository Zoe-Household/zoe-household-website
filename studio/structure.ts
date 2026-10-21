import type { StructureResolver } from "sanity/structure";
import { SUBMISSION_KINDS } from "./schemaTypes/documents/submission";

const submissionList = (S: Parameters<StructureResolver>[0], title: string, filter: string, params: Record<string, string> = {}) =>
  S.documentList()
    .title(title)
    .schemaType("submission")
    .filter(`_type == "submission" && ${filter}`)
    .params(params)
    .defaultOrdering([{ field: "receivedAt", direction: "desc" }]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Zoe Household")
    .items([
      S.documentTypeListItem("event").title("Events"),
      S.documentTypeListItem("campus").title("Campuses"),
      S.divider(),
      S.listItem()
        .title("Submissions")
        .id("submissions")
        .child(
          S.list()
            .title("Submissions")
            .items([
              S.listItem().title("New (needs follow-up)").id("submissions-new").child(submissionList(S, "New submissions", `coalesce(status, "new") == "new"`)),
              S.listItem().title("All submissions").id("submissions-all").child(submissionList(S, "All submissions", "true")),
              S.divider(),
              ...SUBMISSION_KINDS.map((kind) =>
                S.listItem()
                  .title(kind.plural)
                  .id(`submissions-${kind.value}`)
                  .child(submissionList(S, kind.plural, "kind == $kind", { kind: kind.value })),
              ),
            ]),
        ),
    ]);
