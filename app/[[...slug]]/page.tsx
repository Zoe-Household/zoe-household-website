import type { Metadata } from "next";
import { Prototype } from "@/components/Prototype";
import { campuses, routes } from "@/data/site";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export const dynamicParams = false;

const titleByPath: Record<string, string> = {
  "/": "The Life of God, Lived Together",
  "/about": "About",
  "/about/beliefs": "What We Believe",
  "/about/faqs": "Frequently Asked Questions",
  "/visit": "Visit",
  "/sermons": "Sermons",
  "/pneuma-worship": "Pneuma Worship",
  "/events": "Global Events",
  "/events/ignite": "Ignite",
  "/events/camp-meeting": "Camp Meeting",
  "/events/still-waters": "Still Waters",
  "/resources": "Resources",
  "/resources/scholarship": "Zoe Scholarship",
  "/prayer": "Prayer",
  "/give": "Give",
};

function toPath(slug?: string[]) {
  return slug?.length ? `/${slug.join("/")}` : "/";
}

export function generateStaticParams() {
  return routes.map((route) => ({
    slug: route === "/" ? undefined : route.slice(1).split("/"),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = toPath(slug);
  const campus = path.startsWith("/visit/") ? campuses.find((item) => item.slug === path.split("/")[2]) : undefined;
  const title = campus ? `Visit ${campus.shortName}` : titleByPath[path] ?? "Zoe Household";
  const description = campus
    ? `Service information, directions, family check-in, and visitor planning for ${campus.name}.`
    : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <Prototype path={toPath(slug)} />;
}
