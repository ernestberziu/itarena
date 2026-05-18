export const ADMIN_LIST_PAGE_SIZE = 25;
export const ADMIN_LIST_PAGE_SIZE_MAX = 50;

export type PaginatedListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export function buildHasMore(page: number, pageSize: number, total: number): boolean {
  return page * pageSize < total;
}

export function parseListPageParams(searchParams: URLSearchParams): {
  page: number;
  pageSize: number;
  skip: number;
} {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawSize = Number.parseInt(searchParams.get("pageSize") ?? String(ADMIN_LIST_PAGE_SIZE), 10);
  const pageSize = Math.min(
    ADMIN_LIST_PAGE_SIZE_MAX,
    Math.max(1, rawSize || ADMIN_LIST_PAGE_SIZE)
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedListResponse<T> {
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: buildHasMore(page, pageSize, total),
  };
}
