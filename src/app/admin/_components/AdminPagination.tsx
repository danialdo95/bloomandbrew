import Link from "next/link";

type AdminPaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  params?: Record<string, string | undefined>;
};

function getHref(
  basePath: string,
  page: number,
  params: Record<string, string | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function AdminPagination({
  basePath,
  currentPage,
  totalPages,
  total,
  pageSize,
  params = {},
}: AdminPaginationProps) {
  const firstItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, total);
  const previousClass = currentPage <= 1
    ? "pointer-events-none opacity-45"
    : "hover:border-[#c45572] hover:text-[#c45572]";
  const nextClass = currentPage >= totalPages
    ? "pointer-events-none opacity-45"
    : "hover:border-[#c45572] hover:text-[#c45572]";

  return (
    <div className="flex flex-col gap-3 border-t border-[#f2e8df] px-5 py-4 text-sm font-bold text-[#6f6259] sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {firstItem.toLocaleString()}-{lastItem.toLocaleString()} of{" "}
        {total.toLocaleString()}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={getHref(basePath, Math.max(currentPage - 1, 1), params)}
          aria-disabled={currentPage <= 1}
          className={`rounded-[6px] border border-[#eadfd4] px-3 py-2 text-xs font-black text-[#211f1d] transition ${previousClass}`}
        >
          Previous
        </Link>
        <span className="rounded-[6px] bg-[#fff8f2] px-3 py-2 text-xs font-black text-[#211f1d]">
          Page {currentPage} of {totalPages}
        </span>
        <Link
          href={getHref(basePath, Math.min(currentPage + 1, totalPages), params)}
          aria-disabled={currentPage >= totalPages}
          className={`rounded-[6px] border border-[#eadfd4] px-3 py-2 text-xs font-black text-[#211f1d] transition ${nextClass}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
