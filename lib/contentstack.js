import Contentstack from "contentstack";

/** Lazily created so `import` does not throw when env vars are missing (e.g. CI before secrets load). */
let stackSingleton = null;

/**
 * Returns the configured stack, or `null` if
 * `CONTENTSTACK_API_KEY`, `CONTENTSTACK_DELIVERY_TOKEN`, or `CONTENTSTACK_ENVIRONMENT` are unset.
 * Configure those in Contentstack Launch (or `.env.local` locally).
 */
export function getStack() {
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN;
  const environment = process.env.CONTENTSTACK_ENVIRONMENT;
  if (!apiKey || !deliveryToken || !environment) {
    return null;
  }
  if (!stackSingleton) {
    stackSingleton = Contentstack.Stack({
      api_key: apiKey,
      delivery_token: deliveryToken,
      environment,
    });
  }
  return stackSingleton;
}

const PAGE_SIZE = 100;

function entriesFromFindResult(result) {
  if (!result) return [];
  if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
    return result[0];
  }
  if (result.entries && Array.isArray(result.entries)) {
    return result.entries;
  }
  return [];
}

/** Total entry count when `.includeCount()` was used (SDK spreads `[entries, …, count]`). */
function totalCountFromFindResult(batch) {
  if (!Array.isArray(batch)) return undefined;
  for (let i = batch.length - 1; i >= 0; i -= 1) {
    if (typeof batch[i] === "number") return batch[i];
  }
  return undefined;
}

/**
 * Fetches one page of published entries using `.limit()` and `.skip()`.
 * @param {string} contentTypeUid
 * @param {{ page: number; pageSize: number }} opts — `page` is 1-based
 * @returns {Promise<{ entries: object[]; totalCount: number }>}
 */
export async function getEntriesPage(contentTypeUid, { page, pageSize }) {
  const stack = getStack();
  if (!stack) {
    return { entries: [], totalCount: 0 };
  }

  const safePage = Math.max(1, Number(page) || 1);
  const limit = Math.max(1, Number(pageSize) || 1);
  const skip = (safePage - 1) * limit;

  const batch = await stack
    .ContentType(contentTypeUid)
    .Query()
    .toJSON()
    .includeCount()
    .skip(skip)
    .limit(limit)
    .find();

  const entries = entriesFromFindResult(batch);
  const fromApi = totalCountFromFindResult(batch);
  const totalCount = typeof fromApi === "number" ? fromApi : entries.length;

  return { entries, totalCount };
}

/**
 * Fetches all published entries for a content type (paginated via skip/limit).
 * @param {string} contentTypeUid
 * @returns {Promise<object[]>}
 */
export async function getEntries(contentTypeUid) {
  const stack = getStack();
  if (!stack) {
    return [];
  }

  const all = [];
  let skip = 0;

  while (true) {
    const batch = await stack
      .ContentType(contentTypeUid)
      .Query()
      .toJSON()
      .skip(skip)
      .limit(PAGE_SIZE)
      .find();

    const entries = entriesFromFindResult(batch);
    all.push(...entries);

    if (entries.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }

  return all;
}

const NAVIGATION_ITEM_UID = "navigation_item";

/**
 * Fetches all `navigation_item` entries sorted by `order` (ascending).
 * @returns {Promise<object[]>}
 */
export async function getNavigationItems() {
  try {
    const stack = getStack();
    if (!stack) {
      return [];
    }

    const all = [];
    let skip = 0;

    while (true) {
      const batch = await stack
        .ContentType(NAVIGATION_ITEM_UID)
        .Query()
        .toJSON()
        .ascending("order")
        .skip(skip)
        .limit(PAGE_SIZE)
        .find();

      const entries = entriesFromFindResult(batch);
      all.push(...entries);

      if (entries.length < PAGE_SIZE) break;
      skip += PAGE_SIZE;
    }

    return all;
  } catch {
    return [];
  }
}
