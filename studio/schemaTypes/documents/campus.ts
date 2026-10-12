import { defineArrayMember, defineField, defineType } from "sanity";

export const campusType = defineType({
  name: "campus",
  title: "Campus",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Full name", type: "string", description: "e.g. Zoe Household Atlanta", validation: (rule) => rule.required() }),
    defineField({ name: "shortName", title: "Short name", type: "string", description: "e.g. Atlanta", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Must match the campus URL, e.g. atlanta, ikeja, ifako. Changing this changes which campus page these details appear on.",
      options: { source: "shortName", maxLength: 40 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "place", title: "Place label", type: "string", description: "e.g. Atlanta, Georgia" }),
    defineField({ name: "pastor", title: "Campus pastor", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string", description: "Public contact email for this campus (optional)." }),
    defineField({ name: "instagram", title: "Instagram URL", type: "url", description: "Campus-specific Instagram page (optional)." }),
    defineField({ name: "address", title: "Address", type: "string", description: "Leave blank if the location is not public yet." }),
    defineField({ name: "lat", title: "Latitude", type: "number" }),
    defineField({ name: "lng", title: "Longitude", type: "number" }),
    defineField({ name: "verse", title: "Verse", type: "text", rows: 2 }),
    defineField({ name: "verseRef", title: "Verse reference", type: "string" }),
    defineField({ name: "whatToExpect", title: "What to expect", type: "text", rows: 4, description: "A short paragraph for first-time visitors: the vibe, length of service, how to find the room." }),
    defineField({ name: "gettingThere", title: "Getting there", type: "text", rows: 3, description: "Directions, nearest landmarks, or transit notes." }),
    defineField({ name: "parking", title: "Parking", type: "string", description: 'e.g. "Free on-site parking" or "Street parking available".' }),
    defineField({ name: "languages", title: "Service language(s)", type: "string", description: 'e.g. "English" or "English & Yoruba".' }),
    defineField({
      name: "services",
      title: "Service times",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "schedule", title: "Schedule", type: "string", description: 'e.g. "Sundays at 4:00 PM". Leave blank to show "to be announced".' }),
            defineField({ name: "address", title: "Address", type: "string" }),
          ],
          preview: { select: { title: "name", subtitle: "schedule" } },
        }),
      ],
    }),
    defineField({ name: "heroImage", title: "Hero / card image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "gallery",
      title: "Photo gallery",
      type: "array",
      description: "Photos shown on the campus page and in the Moments gallery.",
      of: [defineArrayMember({ type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alt text", type: "string" })] })],
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 50 }),
  ],
  preview: { select: { title: "name", subtitle: "place", media: "heroImage" } },
});
