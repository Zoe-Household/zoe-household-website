/*
 * Copyright (C) 2026 Lenovo
 * All Rights Reserved.
 * Lenovo Confidential Restricted.
 */
import { defineArrayMember, defineField, defineType } from "sanity";

export const SUBMISSION_KINDS = [
  { title: "Prayer request", plural: "Prayer requests", value: "prayer" },
  { title: "Question / inquiry", plural: "Questions & inquiries", value: "inquiry" },
  { title: "Visit plan", plural: "Visit plans", value: "visit" },
  { title: "Zoe Arrows pre-registration", plural: "Zoe Arrows pre-registrations", value: "children" },
  { title: "Service reminder signup", plural: "Service reminder signups", value: "reminder" },
  { title: "Zoe Online access", plural: "Zoe Online access requests", value: "online" },
] as const;

const kindTitle = (value?: string) => SUBMISSION_KINDS.find((kind) => kind.value === value)?.title ?? "Submission";

// Submissions are written by the website with IDs under the private "submission."
// path, so they never appear in the public dataset API. Everything the visitor sent
// is read-only here; staff only change the follow-up status and internal notes.
export const submissionType = defineType({
  name: "submission",
  title: "Submission",
  type: "document",
  fields: [
    defineField({
      name: "status",
      title: "Follow-up status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "In progress", value: "inProgress" },
          { title: "Done", value: "done" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "new",
    }),
    defineField({ name: "notes", title: "Internal notes", type: "text", rows: 3, description: "Only visible to the team in Studio." }),
    defineField({ name: "kind", title: "Form", type: "string", options: { list: SUBMISSION_KINDS.map(({ title, value }) => ({ title, value })) }, readOnly: true }),
    defineField({ name: "receivedAt", title: "Received", type: "datetime", readOnly: true }),
    defineField({ name: "name", title: "Name", type: "string", readOnly: true }),
    defineField({ name: "email", title: "Email", type: "string", readOnly: true }),
    defineField({ name: "phone", title: "Phone", type: "string", readOnly: true }),
    defineField({ name: "campus", title: "Campus", type: "string", readOnly: true }),
    defineField({ name: "topic", title: "Topic", type: "string", readOnly: true, hidden: ({ document }) => !document?.topic }),
    defineField({ name: "region", title: "Campus or region", type: "string", readOnly: true, hidden: ({ document }) => !document?.region }),
    defineField({ name: "message", title: "Message / prayer request", type: "text", rows: 6, readOnly: true }),
    defineField({ name: "timeSensitive", title: "Time-sensitive", type: "boolean", readOnly: true, hidden: ({ document }) => document?.kind !== "prayer" }),
    defineField({ name: "relevantDate", title: "Relevant date", type: "date", readOnly: true, hidden: ({ document }) => !document?.relevantDate }),
    defineField({
      name: "children",
      title: "Children",
      type: "array",
      readOnly: true,
      hidden: ({ document }) => document?.kind !== "children",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "ageGroup", title: "Age group", type: "string" }),
            defineField({ name: "notes", title: "Notes", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "name", subtitle: "ageGroup" } },
        }),
      ],
    }),
    defineField({ name: "campusEmails", title: "Wants campus emails", type: "boolean", readOnly: true, hidden: ({ document }) => document?.kind !== "visit" }),
    defineField({ name: "consent", title: "Agreed to be contacted", type: "boolean", readOnly: true, hidden: ({ document }) => document?.kind !== "inquiry" }),
  ],
  orderings: [{ title: "Newest first", name: "receivedDesc", by: [{ field: "receivedAt", direction: "desc" }] }],
  preview: {
    select: { name: "name", email: "email", kind: "kind", receivedAt: "receivedAt", status: "status" },
    prepare: ({ name, email, kind, receivedAt, status }) => {
      const when = receivedAt ? new Date(receivedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "";
      const flag = status === "done" ? "✓ " : status === "inProgress" ? "… " : "● ";
      return { title: `${flag}${name || email || "Anonymous"}`, subtitle: [kindTitle(kind), when].filter(Boolean).join(" · ") };
    },
  },
});
