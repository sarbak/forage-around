type PhotoSubmission = {
  photo_url?: string | null;
};

export type PhotoWallAnalytics = {
  event: "photo_wall_empty" | "photo_wall_viewed";
  properties: {
    count: number;
    submission_count: number;
  };
};

export function photoWallAnalytics(
  submissions: PhotoSubmission[],
): PhotoWallAnalytics {
  const photoCount = submissions.filter(
    (submission) =>
      typeof submission.photo_url === "string" &&
      submission.photo_url.trim().length > 0,
  ).length;

  return {
    event: photoCount > 0 ? "photo_wall_viewed" : "photo_wall_empty",
    properties: {
      count: photoCount,
      submission_count: submissions.length,
    },
  };
}
