import { useState, useMemo } from "react";

const ITEMS_PER_PAGE = 10;

export function usePagination<T>(items: T[], perPage = ITEMS_PER_PAGE) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, currentPage, perPage]);

  // Reset to page 1 when items change significantly
  const safePage = currentPage > totalPages ? 1 : currentPage;
  if (safePage !== currentPage) setCurrentPage(safePage);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    totalItems: items.length,
  };
}
