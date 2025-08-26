import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Music,
  Users,
  Star,
} from "lucide-react";
import {
  formatNumberCompact,
  convertSnakeCaseToTitleCase,
} from "@/helpers/formatters";

interface PlaylistRecommendationData {
  track_name: string;
  artist_name: string;
  summary: string;
  recommendations: Array<{
    playlist_name: string;
    curator_name: string;
    platform: string;
    playlist_followers: number;
    playlist_url: string;
    recommendation_score: number;
    reasoning: {
      [key: string]: string;
    };
  }>;
}

interface PlaylistRecommendationDisplayProps {
  data: PlaylistRecommendationData;
}

const PlaylistRecommendationDisplay: React.FC<
  PlaylistRecommendationDisplayProps
> = ({ data }) => {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default"; // High score
    if (score >= 70) return "secondary"; // Medium score
    return "outline"; // Lower score
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-orange-600";
  };

  const getPlatformIcon = (platform: string) => {
    // You could add specific platform icons here
    return <Music className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          <div>
            <div className="text-xl font-bold">{data.track_name}</div>
            <div className="text-sm text-muted-foreground">
              by {data.artist_name}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        {data.summary && (
          <div className="p-4 bg-muted/20 rounded">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Analysis Summary
            </h4>
            <p className="text-sm text-muted-foreground">{data.summary}</p>
          </div>
        )}

        {/* Recommendations Overview */}
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Playlist Recommendations</h4>
          <Badge variant="outline">
            {data.recommendations.length} playlists found
          </Badge>
        </div>

        {/* Recommendation Cards */}
        <div className="space-y-4">
          {data.recommendations.map((rec, index) => (
            <Card
              key={index}
              className="transition-all duration-200 hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getPlatformIcon(rec.platform)}
                      <h5 className="font-semibold text-lg">
                        {rec.playlist_name}
                      </h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Curated by {rec.curator_name} • {rec.platform}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatNumberCompact(rec.playlist_followers)}{" "}
                          followers
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={getScoreBadgeVariant(rec.recommendation_score)}
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3" />
                      <span className={getScoreColor(rec.recommendation_score)}>
                        {rec.recommendation_score.toFixed(1)}
                      </span>
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(rec.playlist_url, "_blank")}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Playlist
                    </Button>
                  </div>
                </div>

                {/* Reasoning Section (Expandable) */}
                {rec.reasoning && Object.keys(rec.reasoning).length > 0 && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCard(index)}
                      className="w-full justify-between text-sm"
                    >
                      <span>Why this playlist?</span>
                      {expandedCards.has(index) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>

                    {expandedCards.has(index) && (
                      <div className="mt-3 p-3 bg-muted/30 rounded">
                        <h6 className="font-medium text-sm mb-2">
                          Recommendation Reasoning:
                        </h6>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {Object.entries(rec.reasoning).map(
                            ([factor, explanation], reasonIndex) => (
                              <li
                                key={reasonIndex}
                                className="flex items-start gap-2"
                              >
                                <span className="text-primary mt-1">•</span>
                                <div>
                                  <span className="font-medium text-foreground">
                                    {convertSnakeCaseToTitleCase(factor)}:
                                  </span>{" "}
                                  {explanation}
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        {data.recommendations.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {data.recommendations.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Playlists
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatNumberCompact(
                  data.recommendations.reduce(
                    (sum, rec) => sum + rec.playlist_followers,
                    0
                  )
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Reach</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {(
                  data.recommendations.reduce(
                    (sum, rec) => sum + rec.recommendation_score,
                    0
                  ) / data.recommendations.length
                ).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistRecommendationDisplay;
