import { useSearchParams } from "react-router-dom";

export function usePaymentFilters(defaultBranchId?: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParam = (key: string, value: string | undefined | null) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      return prev;
    }, { replace: true });
  };

  const branchId = searchParams.has("branchId") 
    ? (searchParams.get("branchId") || undefined) 
    : defaultBranchId;
  const search = searchParams.get("search") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "all";
  const paymentMethodFilter = searchParams.get("paymentMethodFilter") || "all";
  const courseTypeFilter = searchParams.get("courseTypeFilter") || "all";
  const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom") as string) : undefined;
  const dateTo = searchParams.get("dateTo") ? new Date(searchParams.get("dateTo") as string) : undefined;
  const sortField = searchParams.get("sortField") || "date";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "desc";

  return {
    branchId, setBranchId: (v: string | undefined) => updateParam("branchId", v),
    search, setSearch: (v: string) => updateParam("search", v),
    paymentStatus, setPaymentStatus: (v: string) => updateParam("paymentStatus", v),
    paymentMethodFilter, setPaymentMethodFilter: (v: string) => updateParam("paymentMethodFilter", v),
    courseTypeFilter, setCourseTypeFilter: (v: string) => updateParam("courseTypeFilter", v),
    dateFrom, setDateFrom: (v: Date | undefined) => updateParam("dateFrom", v ? v.toISOString() : undefined),
    dateTo, setDateTo: (v: Date | undefined) => updateParam("dateTo", v ? v.toISOString() : undefined),
    sortField, sortDir,
    setSortField: (v: string) => updateParam("sortField", v),
    setSortDir: (v: "asc" | "desc") => updateParam("sortDir", v),
    toggleSort: (field: string) => {
      if (sortField === field) {
        updateParam("sortDir", sortDir === "asc" ? "desc" : "asc");
      } else {
        setSearchParams((prev) => {
          prev.set("sortField", field);
          prev.set("sortDir", "asc");
          return prev;
        }, { replace: true });
      }
    },
    clearAllFilters: () => {
      setSearchParams((prev) => {
        prev.delete("dateFrom");
        prev.delete("dateTo");
        prev.delete("paymentStatus");
        prev.delete("paymentMethodFilter");
        prev.delete("courseTypeFilter");
        prev.delete("search");
        return prev;
      }, { replace: true });
    }
  };
}
