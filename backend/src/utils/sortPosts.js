/**
 * Sorts an array of posts based on the specified sorting criteria
 * Supported sorting options:
 * - "recent": Sorts by most recent posts (default)
 * - "top": Sorts by highest score
 * - "trending": Sorts by a combination of score and recency
 * -  "hot": Sorts by a combination of score and views
 * 
 * @param {Array} posts - The array of post objects to sort
 * @param {string} sortBy - The sorting criteria ("recent", "top", "trending", "hot")
 * @returns {Array} - The sorted array of posts
 */

export function applyPostSort(posts, sortBy = "recent") {
  const normalizedSort = String(sortBy || "recent").toLowerCase();
  const now = Date.now();

  if (normalizedSort === "top") {
    return posts.sort((a, b) => b.score - a.score);
  }

  if (normalizedSort === "trending") {
    return posts.sort((a, b) => {
      const aTrend = a.score * 1000 + new Date(a.lastInteraction || a.createdAt || now).getTime();
      const bTrend = b.score * 1000 + new Date(b.lastInteraction || b.createdAt || now).getTime();
      return bTrend - aTrend;
    });
  }

  if (normalizedSort === "hot") {
    return posts.sort((a, b) => {
      const aViews = Number(a.views || 0);
      const bViews = Number(b.views || 0);
      const aHot = a.score * 4 + aViews * 0.02;
      const bHot = b.score * 4 + bViews * 0.02;
      return bHot - aHot;
    });
  }

  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
