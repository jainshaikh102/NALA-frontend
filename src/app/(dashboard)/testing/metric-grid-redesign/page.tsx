"use client";

import React from "react";
import MetricGridDisplay from "@/components/chat/DisplayDataType/MetricGridDisplay";

const mockData = {
  title: "Artist Valuation",
  data: {
    youtube: {
      YOUTUBE_VIEWS: 25836186,
      min_youtube_earnings: 957902.43,
      max_youtube_earnings: 1041198.28,
      YOUTUBE_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/youtube.png",
    },
    spotify: {
      SPOTIFY_PLAYS: 249643084,
      min_spotify_earnings: 578782.4,
      max_spotify_earnings: 629111.3099999999,
      SPOTIFY_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/spotify.png",
    },
    lineMusic: {
      LINE_MUSIC_LIKES: 0,
      min_line_music_earnings: 0,
      max_line_music_earnings: 0,
      LINE_MUSIC_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/line-music.png",
    },
    tiktok: {
      TIKTOK_TOP_VIDEOS_AVG_ENGAGEMENT: 19.289927506044,
      min_tiktok_posts_earnings: 2.37,
      max_tiktok_posts_earnings: 2.57,
      min_tiktok_likes_earnings: 65.33,
      max_tiktok_likes_earnings: 71.03000000000003,
      min_tiktok_comments_earnings: 1.6,
      max_tiktok_comments_earnings: 1.7400000000000002,
      min_tiktok_views_earnings: 2.5300000000000002,
      max_tiktok_views_earnings: 2.75,
      TIKTOK_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/tiktok.png",
    },
    appleMusic: {
      max_apple_earnings: 501092.8769999999,
      APPLEMUSIC_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/apple-music.png",
    },
    amazon: {
      max_amazon_earnings: 317358.8221,
      AMAZON_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/Default.png",
    },
    soundcloud: {
      min_soundcloud_earnings: 355.25,
      max_soundcloud_earnings: 386.15000000000003,
      SOUNDCLOUD_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/soundcloud.png",
    },
    shazam: {
      min_shazam_earnings: 105.14,
      max_shazam_earnings: 114.31000000000003,
      SHAZAM_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/shazam.png",
    },
    lastfm: {
      min_lastfm_listeners_earnings: 179.72000000000003,
      max_lastfm_listeners_earnings: 195.40999999999997,
      min_lastfm_plays_earnings: 16.71,
      max_lastfm_plays_earnings: 18.150000000000002,
      LASTFM_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/lastfm.png",
    },
    genius: {
      min_genius_earnings: 0,
      max_genius_earnings: 0,
      GENIUS_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/Genius.png",
    },
    pandora: {
      min_pandora_streams_earnings: 18.55000000000001,
      max_pandora_streams_earnings: 20.14000000000002,
      min_pandora_stations_earnings: 1.0599999999999998,
      max_pandora_stations_earnings: 1.17,
      PANDORA_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/pandora.png",
    },
    airplay: {
      min_airplay_earnings: 0,
      max_airplay_earnings: 0,
      AIRPLAY_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/Airplay.png",
    },
    siriusxm: {
      min_siriusxm_earnings: 0,
      max_siriusxm_earnings: 0,
      SIRIUSXM_URL:
        "https://blacklion-public-s3.s3.us-east-2.amazonaws.com/Default.png",
    },
    earnings: {
      min_Total_earnings: 1537429.1400000004,
      max_Total_earnings: 1671118.6500000001,
    },
  },
};

export default function MetricGridRedesignTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">MetricGridDisplay - Redesigned</h1>
        <p className="text-muted-foreground">
          This page demonstrates the redesigned MetricGridDisplay component with
          standardized platform cards.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">New Design</h2>
        <MetricGridDisplay data={mockData} />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Design Features</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Standardized card layout for all platforms</li>
          <li>Platform icon and name in header</li>
          <li>Primary metric (Views/Plays/Likes) when available</li>
          <li>Earnings range (min - max) for all platforms</li>
          <li>Consistent dark theme styling</li>
          <li>Responsive grid layout</li>
          <li>Proper handling of missing data</li>
          <li>
            <strong>Smart filtering:</strong> Hides platforms with all zero
            values (except URLs)
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Filtering Logic</h2>
        <div className="bg-muted/20 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            The component automatically hides platforms where all values are 0
            (except URL fields):
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
            <li>
              <strong>LINE Music:</strong> Hidden (0 likes, 0 earnings)
            </li>
            <li>
              <strong>Genius:</strong> Hidden (0 earnings)
            </li>
            <li>
              <strong>AirPlay:</strong> Hidden (0 earnings)
            </li>
            <li>
              <strong>SiriusXM:</strong> Hidden (0 earnings)
            </li>
            <li>
              <strong>Other platforms:</strong> Shown (have non-zero values)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
