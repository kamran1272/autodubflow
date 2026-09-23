import { LIMITS, type Paginated } from '@autodubflow/media-shared';

export interface PageRequest {
  page: number;
  pageSize: number;
}

export function normalizePage(input: Partial<PageRequest>): PageRequest {
  const page = Math.max(1, Math.trunc(input.page ?? 1));
  const pageSize = Math.min(LIMITS.maxPageSize, Math.max(1, Math.trunc(input.pageSize ?? LIMITS.defaultPageSize)));
  return { page, pageSize };
}

export function toSkipTake(input: Partial<PageRequest>) {
  const { page, pageSize } = normalizePage(input);
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

export function buildPage<T>(items: T[], total: number, input: Partial<PageRequest>): Paginated<T> {
  const { page, pageSize } = normalizePage(input);
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function parseDateRange(from?: string | null, to?: string | null): { from?: Date; to?: Date } {
  const parse = (value?: string | null) => {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };
  const range: { from?: Date; to?: Date } = {};
  const fromDate = parse(from);
  const toDate = parse(to);
  if (fromDate) range.from = fromDate;
  if (toDate) range.to = toDate;
  return range;
}
