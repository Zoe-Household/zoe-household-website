export type LibraryVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  duration: string;
  durationSeconds: number;
};

export type LibraryEpisode = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  audioUrl: string;
  link: string;
};

const SERMONS = "https://www.pastordolapolawal.com/api/sermons";
const ITUNES = "https://itunes.apple.com/lookup?id=1790253590&entity=podcastEpisode&limit=50";
export const LONG_VIDEO_SECONDS = 1200;
export const SHORT_VIDEO_SECONDS = 300;

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

function asVideo(raw: Record<string, unknown>): LibraryVideo | null {
  const id = String(raw.id ?? "");
  if (!id) return null;
  return {
    id,
    title: String(raw.title ?? "Untitled"),
    description: String(raw.description ?? ""),
    thumbnail: youtubeThumb(id),
    publishedAt: String(raw.publishedAt ?? ""),
    viewCount: Number(raw.viewCount ?? 0),
    duration: String(raw.duration ?? ""),
    durationSeconds: Number(raw.durationSeconds ?? 0),
  };
}

export async function fetchSermonPage(options: { sort?: string; limit?: number; page?: string; search?: string }) {
  const url = new URL(SERMONS);
  url.searchParams.set("sort", options.sort === "popular" || options.sort === "oldest" ? options.sort : "date");
  url.searchParams.set("limit", String(options.limit ?? 12));
  url.searchParams.set("search", options.search ?? "");
  if (options.page) url.searchParams.set("page", options.page);
  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error("Sermons are unavailable right now.");
  const payload = await response.json();
  const data = payload.data ?? payload;
  const items = Array.isArray(data.items) ? data.items.map((item: Record<string, unknown>) => asVideo(item)).filter(Boolean) : [];
  return {
    items: items as LibraryVideo[],
    nextPageToken: typeof data.nextPageToken === "string" ? data.nextPageToken : null,
  };
}

let longCatalog: { at: number; videos: LibraryVideo[] } | null = null;

async function latestLongSermons() {
  const now = Date.now();
  if (longCatalog && now - longCatalog.at < 30 * 60 * 1000) return longCatalog.videos;
  const longs: LibraryVideo[] = [];
  let page: string | null = null;
  for (let attempt = 0; attempt < 8 && longs.length < 20; attempt += 1) {
    const batch = await fetchSermonPage({ sort: "date", limit: 20, page: page ?? undefined });
    for (const video of batch.items) {
      if (video.durationSeconds >= LONG_VIDEO_SECONDS) longs.push(video);
      if (longs.length >= 20) break;
    }
    page = batch.nextPageToken;
    if (!page) break;
  }
  longCatalog = { at: now, videos: longs };
  return longs;
}

export async function fetchFeaturedSermon() {
  const longs = await latestLongSermons();
  if (!longs.length) return null;
  const video = longs[Math.floor(Math.random() * longs.length)];
  return { video, pool: longs.length };
}

function formatClock(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function largeArtwork(url: string) {
  if (!url) return "";
  return url.replace(/\/\d+x\d+bb(?=\.)/, "/1400x1400bb");
}

function plainText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export async function fetchPodcastEpisodes(): Promise<LibraryEpisode[]> {
  const response = await fetch(ITUNES, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error("Podcast episodes are unavailable right now.");
  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : [];
  return results
    .filter((item: { wrapperType?: string }) => item.wrapperType === "podcastEpisode")
    .map((item: Record<string, unknown>) => ({
      id: String(item.trackId ?? ""),
      title: String(item.trackName ?? "Untitled"),
      description: plainText(String(item.description ?? "")),
      thumbnail: largeArtwork(String(item.artworkUrl600 ?? item.artworkUrl160 ?? "")),
      publishedAt: String(item.releaseDate ?? ""),
      duration: formatClock(Number(item.trackTimeMillis ?? 0)),
      audioUrl: String(item.episodeUrl ?? ""),
      link: String(item.trackViewUrl ?? "https://podcasts.apple.com/ng/podcast/pastor-dolapo-lawal/id1790253590"),
    }))
    .filter((item: LibraryEpisode) => item.id);
}
