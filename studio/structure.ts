import type { StructureResolver } from "sanity/structure";
import { SUBMISSION_CAMPUSES, SUBMISSION_KINDS } from "./schemaTypes/documents/submission";

type Builder = Parameters<StructureResolver>[0];
type OrderingItem = { field: string; direction: "asc" | "desc" };

const BY_DATE: OrderingItem[] = [{ field: "receivedAt", direction: "desc" }];
const BY_KIND_AND_DATE: OrderingItem[] = [
  { field: "kind", direction: "asc" },
  { field: "receivedAt", direction: "desc" },
];
const BY_CAMPUS_AND_KIND: OrderingItem[] = [
  { field: "campus", direction: "asc" },
  { field: "kind", direction: "asc" },
  { field: "receivedAt", direction: "desc" },
];

const campusAliases = (campus: (typeof SUBMISSION_CAMPUSES)[number]) => [
  campus.value,
  campus.shortName,
  campus.title,
  `Zoe Household ${campus.shortName}`,
];

const ALL_KNOWN_CAMPUSES = SUBMISSION_CAMPUSES.flatMap(campusAliases);

const submissionList = (
  S: Builder,
  title: string,
  filter: string,
  params: Record<string, unknown> = {},
  ordering: OrderingItem[] = BY_DATE,
) =>
  S.documentList()
    .title(title)
    .schemaType("submission")
    .filter(`_type == "submission" && ${filter}`)
    .params(params)
    .defaultOrdering(ordering);

const campusSubmissionItems = (
  S: Builder,
  idPrefix: string,
  campusLabel: string,
  campusFilter: string,
  campusParams: Record<string, unknown>,
) => [
  ...SUBMISSION_KINDS.map((kind) =>
    S.listItem()
      .title(kind.plural)
      .id(`${idPrefix}-${kind.value}`)
      .child(
        submissionList(
          S,
          `${campusLabel} · ${kind.plural}`,
          `(${campusFilter}) && kind == $kind`,
          { ...campusParams, kind: kind.value },
          BY_DATE,
        ),
      ),
  ),
  S.divider(),
  S.listItem()
    .title("New (needs follow-up)")
    .id(`${idPrefix}-new`)
    .child(
      submissionList(
        S,
        `${campusLabel} · New submissions`,
        `(${campusFilter}) && coalesce(status, "new") == "new"`,
        campusParams,
        BY_KIND_AND_DATE,
      ),
    ),
  S.listItem()
    .title(`All ${campusLabel} submissions`)
    .id(`${idPrefix}-all`)
    .child(submissionList(S, `${campusLabel} · All submissions`, campusFilter, campusParams, BY_KIND_AND_DATE)),
];

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
            .title("Submissions by Campus")
            .items([
              ...SUBMISSION_CAMPUSES.map((campus) =>
                S.listItem()
                  .title(campus.title)
                  .id(`submissions-campus-${campus.value}`)
                  .child(
                    S.list()
                      .title(campus.title)
                      .items(
                        campusSubmissionItems(
                          S,
                          `submissions-${campus.value}`,
                          campus.title,
                          "campus in $campusValues",
                          { campusValues: campusAliases(campus) },
                        ),
                      ),
                  ),
              ),
              S.listItem()
                .title("General / No campus")
                .id("submissions-campus-none")
                .child(
                  S.list()
                    .title("General / No campus")
                    .items(
                      campusSubmissionItems(
                        S,
                        "submissions-none",
                        "General / No campus",
                        `!defined(campus) || campus == "" || campus == "none" || !(campus in $knownCampuses)`,
                        { knownCampuses: ALL_KNOWN_CAMPUSES },
                      ),
                    ),
                ),
              S.divider(),
              S.listItem()
                .title("New (needs follow-up)")
                .id("submissions-new")
                .child(
                  submissionList(
                    S,
                    "New submissions (by campus & type)",
                    `coalesce(status, "new") == "new"`,
                    {},
                    BY_CAMPUS_AND_KIND,
                  ),
                ),
              S.listItem()
                .title("All submissions")
                .id("submissions-all")
                .child(submissionList(S, "All submissions (by campus & type)", "true", {}, BY_CAMPUS_AND_KIND)),
            ]),
        ),
    ]);
