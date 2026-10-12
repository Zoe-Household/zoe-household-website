import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { dataset, projectId } from "@/sanity/env";

const builder = imageUrlBuilder({ projectId: projectId || "placeholder", dataset });

export function urlForImage(source: SanityImageSource | undefined, width = 1600) {
  if (!source || !(source as { asset?: unknown }).asset) return undefined;
  return builder.image(source).width(width).fit("max").auto("format").url();
}
