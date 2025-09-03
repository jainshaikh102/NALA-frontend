const ViralityReportData = {
  role: "assistant",
  content:
    "I've analyzed the recent trends for Idris Elba. The final virality score is 6.35/100, which suggests a 'Stable' status.",
  username: "NALA",
  timestamp: "2025-08-27T10:25:56.482225",
  display_data: {
    artist_name: "Idris Elba",
    final_score: 6.35,
    verdict: "Stable",
    summary: "",
    audience_analysis:
      "The artist's overall audience is expanding at a healthy rate.",
    engagement_analysis:
      "Fan engagement levels are consistent with the recent baseline.",
    audience_growth_percentage: 10.34896850236786,
    engagement_growth_percentage: 0.3423584130903224,
    detailed_metrics: {
      spotify_followers: {
        growth: 22.771570361995934,
        status: "calculated" as const,
        baseline_avg: 4697.137931034483,
        recent_avg: 5766.75,
      },
      instagram_followers: {
        growth: -0.0031997139888648766,
        status: "calculated" as const,
        baseline_avg: 6744352.8,
        recent_avg: 6744137,
      },
      youtube_subscribers: {
        growth: 0,
        status: "unavailable" as const,
        baseline_avg: 0,
        recent_avg: 0,
      },
      tiktok_followers: {
        growth: 0,
        status: "unavailable" as const,
        baseline_avg: 0,
        recent_avg: 0,
      },
      spotify_monthly_listeners: {
        growth: -0.40178769476191584,
        status: "calculated" as const,
        baseline_avg: 914095.724137931,
        recent_avg: 910423,
      },
      youtube_views: {
        growth: 0.11047214891894544,
        status: "calculated" as const,
        baseline_avg: 50496188.9,
        recent_avg: 50551973.125,
      },
      tiktok_likes: {
        growth: 0,
        status: "unavailable" as const,
        baseline_avg: 0,
        recent_avg: 0,
      },
      soundcloud_plays: {
        growth: 1.6704371547893795,
        status: "calculated" as const,
        baseline_avg: 745806.7666666667,
        recent_avg: 758265,
      },
    },
  },
  data_type: "virality_report",
  query: null,
  audio_base64: null,
};

export default ViralityReportData;
