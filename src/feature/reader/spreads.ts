// Pairing logic for the two-page (spread) view. Shared by the build-time
// chunking in PageViewer.astro and the keyboard stepping in ChapterLayout.astro
// so the two can never disagree on how pages are grouped.
//
// offset=1 => page 1 (index 0) stands alone, then pairs: [[0],[1,2],[3,4],...]
// This mirrors how a physical volume opens on a single page and gives interior
// double-page splash art the best chance of landing together on one facing row.
export function computeSpreads(pageCount: number, offset: number = 1): number[][] {
  const spreads: number[][] = [];
  let i = 0;

  if (offset === 1 && pageCount > 0) {
    spreads.push([0]);
    i = 1;
  }

  for (; i < pageCount; i += 2) {
    spreads.push(i + 1 < pageCount ? [i, i + 1] : [i]);
  }

  return spreads;
}

export const spreadIndexOfPage = (
  spreads: number[][],
  page: number,
): number => spreads.findIndex((group) => group.includes(page));

export const leadingPageOfSpread = (group: number[]): number => group[0];
