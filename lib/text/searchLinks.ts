/**
 * SearchLinks interface defines the set of external resources
 * we generate for each keyword.
 */
export interface SearchLinks {
    google: string;
    wikipedia: string;
    youtube: string;
}

/**
 * generateSearchLinks
 * 
 * Creates encoded URLs for the requested search engines.
 * 
 * @param keyword - The keyword to search for
 */
export function generateSearchLinks(keyword: string): SearchLinks {
    const encoded = encodeURIComponent(keyword);

    return {
        google: `https://www.google.com/search?q=${encoded}`,
        wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search=${encoded}`,
        youtube: `https://www.youtube.com/results?search_query=${encoded}`,
    };
}
