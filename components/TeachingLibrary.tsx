"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { LibraryEpisode, LibraryVideo } from "@/lib/library";

type SermonSort = "date" | "popular" | "oldest";
type DurationFilter = "all" | "long" | "short";
type PodcastSort = "latest" | "oldest";

const sermonCategories = ["All videos", "Popular", "Latest", "Oldest", "Long videos", "Short videos"];
const sermonSortMap: Record<string, SermonSort> = {
  "All videos": "date",
  Popular: "popular",
  Latest: "date",
  Oldest: "oldest",
  "Long videos": "date",
  "Short videos": "date",
};
const sermonDurationMap: Record<string, DurationFilter> = {
  "All videos": "all",
  Popular: "all",
  Latest: "all",
  Oldest: "all",
  "Long videos": "long",
  "Short videos": "short",
};
const podcastCategories = ["All episodes", "Latest", "Oldest"];
const podcastSortMap: Record<string, PodcastSort> = {
  "All episodes": "latest",
  Latest: "latest",
  Oldest: "oldest",
};

function youtubeFrames(id: string) {
  return [
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
  ];
}

function YoutubeImage({ id, alt }: { id: string; alt: string }) {
  const frames = youtubeFrames(id);
  const [index, setIndex] = useState(0);
  const advance = () => setIndex((current) => Math.min(current + 1, frames.length - 1));
  return (
    <img
      src={frames[index]}
      alt={alt}
      onError={advance}
      onLoad={(event) => {
        if (event.currentTarget.naturalWidth > 0 && event.currentTarget.naturalWidth < 200) advance();
      }}
    />
  );
}

export function TeachingLibrary({ seed, seedKey }: { seed: string; seedKey: number }) {
  const [tab, setTab] = useState<"sermons" | "podcast">("sermons");
  const [sermonCategory, setSermonCategory] = useState("All videos");
  const [sermonSort, setSermonSort] = useState<SermonSort>("date");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [sermonInput, setSermonInput] = useState("");
  const [sermonQuery, setSermonQuery] = useState("");
  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [sermonLoading, setSermonLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sermonError, setSermonError] = useState("");
  const [featured, setFeatured] = useState<LibraryVideo | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [episodes, setEpisodes] = useState<LibraryEpisode[]>([]);
  const [podcastLoading, setPodcastLoading] = useState(true);
  const [podcastError, setPodcastError] = useState("");
  const [podcastCategory, setPodcastCategory] = useState("All episodes");
  const [podcastSort, setPodcastSort] = useState<PodcastSort>("latest");
  const [podcastInput, setPodcastInput] = useState("");
  const [podcastQuery, setPodcastQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [playingEpisode, setPlayingEpisode] = useState<LibraryEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState("0:00");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!seedKey) return;
    setTab("sermons");
    setSermonInput(seed);
    setSermonQuery(seed);
  }, [seed, seedKey]);

  useEffect(() => {
    let cancelled = false;
    setSermonLoading(true);
    setSermonError("");
    const params = new URLSearchParams({ sort: sermonSort, search: sermonQuery });
    fetch(`/api/library/sermons?${params}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setVideos(data.items ?? []);
        setNextPage(data.nextPageToken ?? null);
        if (!data.ok && data.error) setSermonError(data.error);
      })
      .catch(() => {
        if (!cancelled) setSermonError("Sermons are unavailable right now.");
      })
      .finally(() => {
        if (!cancelled) setSermonLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sermonSort, sermonQuery]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/library/featured")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setFeatured(data.video ?? null);
      })
      .catch(() => {
        if (!cancelled) setFeatured(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/library/podcast")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setEpisodes(data.episodes ?? []);
        if (!data.ok && data.error) setPodcastError(data.error);
      })
      .catch(() => {
        if (!cancelled) setPodcastError("Podcast episodes are unavailable right now.");
      })
      .finally(() => {
        if (!cancelled) setPodcastLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!playingId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlayingId(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [playingId]);

  const filteredVideos = videos.filter((video) => {
    if (durationFilter === "long") return video.durationSeconds >= 1200;
    if (durationFilter === "short") return video.durationSeconds < 300;
    return true;
  });

  const filteredEpisodes = useMemo(() => {
    let result = [...episodes];
    const query = podcastQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((episode) => episode.title.toLowerCase().includes(query) || episode.description.toLowerCase().includes(query));
    }
    result.sort((a, b) => {
      const left = new Date(a.publishedAt).getTime();
      const right = new Date(b.publishedAt).getTime();
      return podcastSort === "oldest" ? left - right : right - left;
    });
    return result;
  }, [episodes, podcastQuery, podcastSort]);

  const featuredEpisode = playingEpisode ?? filteredEpisodes[0] ?? null;
  const visibleEpisodes = filteredEpisodes.slice(0, visibleCount);

  const chooseSermonCategory = (category: string) => {
    setSermonCategory(category);
    setSermonSort(sermonSortMap[category] ?? "date");
    setDurationFilter(sermonDurationMap[category] ?? "all");
  };

  const chooseSermonSort = (sort: SermonSort) => {
    setSermonSort(sort);
    setDurationFilter("all");
    const category = Object.entries(sermonSortMap).find(([, value]) => value === sort)?.[0] ?? "All videos";
    setSermonCategory(category);
  };

  const searchSermons = (event: FormEvent) => {
    event.preventDefault();
    setSermonQuery(sermonInput.trim());
  };

  const loadMoreSermons = async () => {
    if (!nextPage || loadingMore) return;
    setLoadingMore(true);
    const params = new URLSearchParams({ sort: sermonSort, search: sermonQuery, page: nextPage });
    const response = await fetch(`/api/library/sermons?${params}`);
    const data = await response.json();
    setVideos((current) => [...current, ...(data.items ?? [])]);
    setNextPage(data.nextPageToken ?? null);
    setLoadingMore(false);
  };

  const choosePodcastCategory = (category: string) => {
    setPodcastCategory(category);
    setPodcastSort(podcastSortMap[category] ?? "latest");
    setVisibleCount(6);
  };

  const searchPodcasts = (event: FormEvent) => {
    event.preventDefault();
    setPodcastQuery(podcastInput.trim());
    setVisibleCount(6);
  };

  const clock = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const remain = total % 60;
    return `${minutes}:${String(remain).padStart(2, "0")}`;
  };

  const playEpisode = (episode: LibraryEpisode) => {
    const audio = audioRef.current;
    if (!audio || !episode.audioUrl) return;
    if (playingEpisode?.id === episode.id) {
      if (audio.paused) {
        void audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }
    setPlayingEpisode(episode);
    audio.src = episode.audioUrl;
    void audio.play();
    setIsPlaying(true);
    setProgress(0);
    setElapsed("0:00");
  };

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || playingEpisode?.id !== featuredEpisode?.id) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  };

  return (
    <section id="sermon-library" className="teaching-library">
      <div className="teaching-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "sermons"} className={tab === "sermons" ? "is-active" : ""} onClick={() => setTab("sermons")}>Sermons</button>
        <button type="button" role="tab" aria-selected={tab === "podcast"} className={tab === "podcast" ? "is-active" : ""} onClick={() => setTab("podcast")}>Podcast</button>
      </div>

      {tab === "sermons" ? (
        <>
          <div className="sermon-library-head">
            <div>
              <h2>Latest Sermons</h2>
              <p>Grow through Bible-centered teachings that deepen your faith and inspire Christ-centered living.</p>
            </div>
            <form className="sermon-search" onSubmit={searchSermons}>
              <input value={sermonInput} onChange={(event) => setSermonInput(event.target.value)} placeholder="Search sermons" aria-label="Search sermons" />
              <select value={sermonSort} aria-label="Sort sermons" onChange={(event) => chooseSermonSort(event.target.value as SermonSort)}>
                <option value="date">Sort: Latest</option>
                <option value="popular">Sort: Popular</option>
                <option value="oldest">Sort: Oldest</option>
              </select>
            </form>
          </div>
          <div className="teaching-pills">
            {sermonCategories.map((category) => (
              <button key={category} type="button" className={sermonCategory === category ? "is-active" : ""} onClick={() => chooseSermonCategory(category)}>{category}</button>
            ))}
          </div>

          {featured ? (
            <button type="button" className="library-feature" onClick={() => setPlayingId(featured.id)} aria-label={featured.title}>
              <YoutubeImage id={featured.id} alt="" />
              <span>
                <strong>{featured.title}</strong>
              </span>
            </button>
          ) : null}

          {sermonLoading ? <p className="sermon-empty">Loading sermons…</p> : null}
          {sermonError ? <p className="sermon-empty">{sermonError}</p> : null}
          {!sermonLoading && filteredVideos.length === 0 ? <p className="sermon-empty">No sermons match that search.</p> : null}
          <div className="sermon-video-grid">
            {filteredVideos.map((video) => (
              <button type="button" className="library-tile" key={`${video.id}-${video.publishedAt}`} onClick={() => setPlayingId(video.id)} aria-label={video.title}>
                <YoutubeImage id={video.id} alt="" />
                <strong>{video.title}</strong>
                {video.duration ? <em>{video.duration}</em> : null}
              </button>
            ))}
          </div>
          {nextPage ? <button className="sermon-more" type="button" onClick={loadMoreSermons} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load more Sermons"} <i aria-hidden="true">→</i></button> : null}
        </>
      ) : (
        <>
          <div className="sermon-library-head">
            <div>
              <h2>Podcast</h2>
              <p>Whether you are commuting, working, or spending quiet time with God, the Pastor Dolapo Lawal podcast brings biblical teaching straight to you.</p>
            </div>
            <form className="sermon-search" onSubmit={searchPodcasts}>
              <input value={podcastInput} onChange={(event) => setPodcastInput(event.target.value)} placeholder="Search episodes" aria-label="Search episodes" />
              <select
                value={podcastSort}
                aria-label="Sort episodes"
                onChange={(event) => {
                  const sort = event.target.value as PodcastSort;
                  setPodcastSort(sort);
                  setPodcastCategory(sort === "oldest" ? "Oldest" : "All episodes");
                  setVisibleCount(6);
                }}
              >
                <option value="latest">Sort: Latest</option>
                <option value="oldest">Sort: Oldest</option>
              </select>
            </form>
          </div>
          <div className="teaching-pills">
            {podcastCategories.map((category) => (
              <button key={category} type="button" className={podcastCategory === category ? "is-active" : ""} onClick={() => choosePodcastCategory(category)}>{category}</button>
            ))}
          </div>

          {podcastLoading ? <p className="sermon-empty">Loading episodes…</p> : null}
          {podcastError ? <p className="sermon-empty">{podcastError}</p> : null}

          {featuredEpisode ? (
            <article className="podcast-feature">
              <div className="podcast-feature-art">
                <img src={featuredEpisode.thumbnail} alt="" />
                <em>{playingEpisode ? "Currently Playing" : "Latest Episode"}</em>
              </div>
              <div className="podcast-feature-copy">
                <h3>{featuredEpisode.title}</h3>
                <p>{featuredEpisode.description}</p>
                <div className="podcast-player">
                  <button type="button" onClick={() => playEpisode(featuredEpisode)} aria-label={isPlaying && playingEpisode?.id === featuredEpisode.id ? "Pause" : "Play"}>
                    {isPlaying && playingEpisode?.id === featuredEpisode.id ? "Pause" : "Play"}
                  </button>
                  <div>
                    <div className="podcast-progress" onClick={seek} role="slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} tabIndex={0}>
                      <i style={{ width: `${playingEpisode?.id === featuredEpisode.id ? progress : 0}%` }} />
                    </div>
                    <span>
                      <em>{playingEpisode?.id === featuredEpisode.id ? elapsed : "0:00"}</em>
                      <em>{featuredEpisode.duration || "0:00"}</em>
                    </span>
                  </div>
                </div>
                <div className="podcast-platforms">
                  <a href="https://open.spotify.com/show/4K39wRltzUdLx8EZyYzCPH" target="_blank" rel="noreferrer">Listen on Spotify</a>
                  <a href="https://podcasts.apple.com/ng/podcast/pastor-dolapo-lawal/id1790253590" target="_blank" rel="noreferrer">Listen on Apple Podcast</a>
                </div>
              </div>
            </article>
          ) : null}

          {!podcastLoading && filteredEpisodes.length === 0 ? <p className="sermon-empty">{podcastQuery ? `No episodes found for “${podcastQuery}”` : "No episodes available at the moment."}</p> : null}
          <div className="podcast-grid">
            {visibleEpisodes.map((episode) => {
              const active = isPlaying && playingEpisode?.id === episode.id;
              return (
                <article className={active ? "podcast-card is-playing" : "podcast-card"} key={episode.id}>
                  <button type="button" onClick={() => playEpisode(episode)} aria-label={episode.title}>
                    <img src={episode.thumbnail} alt="" />
                  </button>
                  <h3>{episode.title}</h3>
                  <p>{episode.description}</p>
                </article>
              );
            })}
          </div>
          {visibleCount < filteredEpisodes.length ? <button className="sermon-more" type="button" onClick={() => setVisibleCount((count) => count + 6)}>Load more Episodes <i aria-hidden="true">→</i></button> : null}
          <audio
            ref={audioRef}
            preload="none"
            onTimeUpdate={(event) => {
              const audio = event.currentTarget;
              setElapsed(clock(audio.currentTime));
              setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
            }}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
        </>
      )}

      {playingId ? (
        <div className="sermon-player" role="dialog" aria-modal="true" aria-label="Sermon player">
          <button type="button" className="sermon-player-close" onClick={() => setPlayingId(null)} aria-label="Close">Close</button>
          <iframe
            title="Sermon"
            src={`https://www.youtube.com/embed/${playingId}?autoplay=1`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
    </section>
  );
}
