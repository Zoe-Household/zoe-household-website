import { defineArrayMember, defineField, defineType } from "sanity";

export const eventType = defineType({
  name: "event",
  title: "Event",
  type: "document",
  groups: [
    { name: "details", title: "Details", default: true },
    { name: "when", title: "Date & place" },
    { name: "page", title: "Event page" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "details", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "details",
      options: { source: "title", maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      group: "details",
      options: { list: ["Global Gathering", "Retreat", "Conference", "Workshop", "Service", "Outreach"] },
      initialValue: "Global Gathering",
    }),
    defineField({ name: "image", title: "Image", type: "image", group: "details", options: { hotspot: true }, validation: (rule) => rule.required().warning("Events without an image show a placeholder photo.") }),
    defineField({ name: "summary", title: "Card summary", type: "text", rows: 3, group: "details" }),
    defineField({ name: "registerUrl", title: "Register / RSVP link", type: "url", group: "details" }),
    defineField({
      name: "startDate",
      title: "Starts",
      type: "datetime",
      group: "when",
      description: "The website uses this to show the next event first and to move the event to “past” automatically once it ends.",
      validation: (rule) => rule.required().warning("Without a start date the event is listed as “Dates to be announced” after dated events."),
    }),
    defineField({
      name: "endDate",
      title: "Ends",
      type: "datetime",
      group: "when",
      description: "Optional. If empty, the event is treated as lasting four hours.",
      validation: (rule) => rule.custom((end, context) => {
        const start = (context.document as { startDate?: string } | undefined)?.startDate;
        if (!end || !start) return true;
        return Date.parse(end as string) >= Date.parse(start) || "The end must be after the start.";
      }),
    }),
    defineField({ name: "dateLabel", title: "Date label override", type: "string", group: "when", description: 'Optional. e.g. "November 13th – 15th". Shown instead of the dates above when set.' }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      group: "when",
      description: "Full address or city and country, e.g. “6865 Factory Shoals Rd SW, Austell, GA 30168”. The website finds this on the map to show the event first to people nearby. Write “Location to be announced” if it isn’t public yet.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "geo",
      title: "Map pin (optional)",
      type: "geopoint",
      group: "when",
      description: "Only needed if the address above can’t be found on the map or lands in the wrong place. Enter latitude and longitude.",
    }),
    defineField({ name: "campus", title: "Campus", type: "reference", group: "when", to: [{ type: "campus" }], description: "Leave empty for a global, all-household event." }),
    defineField({
      name: "status",
      title: "Status (only for events without dates)",
      type: "string",
      group: "when",
      description: "Ignored once a start date is set — the website works out upcoming, happening now, and past from the dates.",
      options: { list: [{ title: "Upcoming", value: "upcoming" }, { title: "Happening now", value: "live" }, { title: "Past", value: "past" }], layout: "radio" },
      initialValue: "upcoming",
    }),
    defineField({ name: "intro", title: "Detail intro", type: "string", group: "page" }),
    defineField({
      name: "body",
      title: "Detail body",
      type: "array",
      group: "page",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({ name: "featured", title: "Feature on homepage", type: "boolean", group: "details", initialValue: false, hidden: true }),
    defineField({ name: "order", title: "Display order", type: "number", group: "details", initialValue: 50, hidden: true }),
  ],
  orderings: [{ title: "Start date, newest first", name: "startDesc", by: [{ field: "startDate", direction: "desc" }] }],
  preview: {
    select: { title: "title", dateLabel: "dateLabel", startDate: "startDate", location: "location", media: "image" },
    prepare: ({ title, dateLabel, startDate, location, media }) => ({
      title,
      subtitle: [dateLabel || (startDate ? new Date(startDate).toLocaleDateString("en-US", { dateStyle: "medium" }) : "No date"), location].filter(Boolean).join(" · "),
      media,
    }),
  },
});
