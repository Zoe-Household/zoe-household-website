import { defineArrayMember, defineField, defineType } from "sanity";

export const eventType = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: { list: ["Global Gathering", "Retreat", "Conference", "Workshop", "Service", "Outreach"] },
      initialValue: "Global Gathering",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: [{ title: "Upcoming", value: "upcoming" }, { title: "Happening now", value: "live" }, { title: "Past", value: "past" }], layout: "radio" },
      initialValue: "upcoming",
    }),
    defineField({ name: "featured", title: "Feature on homepage", type: "boolean", initialValue: false }),
    defineField({ name: "startDate", title: "Start date", type: "datetime" }),
    defineField({ name: "endDate", title: "End date", type: "datetime" }),
    defineField({ name: "dateLabel", title: "Date label override", type: "string", description: 'Optional. e.g. "Dates to be announced". Used instead of the dates above when set.' }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "campus", title: "Campus", type: "reference", to: [{ type: "campus" }], description: "Leave empty for a global, all-household event." }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "summary", title: "Card summary", type: "text", rows: 3 }),
    defineField({ name: "intro", title: "Detail intro", type: "string" }),
    defineField({
      name: "body",
      title: "Detail body",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({ name: "registerUrl", title: "Register / RSVP link", type: "url" }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 50 }),
  ],
  preview: { select: { title: "title", subtitle: "dateLabel", media: "image" } },
});
