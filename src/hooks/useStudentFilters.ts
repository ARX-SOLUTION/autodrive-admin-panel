import { useSearchParams } from "react-router-dom";
import { CourseType } from "@/types/student";

export function useStudentFilters(defaultBranchId?: string) {
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

  const courseType = (searchParams.get("courseType") as CourseType) || "tezkor";
  
  // Provide defaultBranchId initially if not in URL but needed
  const branchId = searchParams.has("branchId") 
    ? (searchParams.get("branchId") || undefined) 
    : defaultBranchId;
    
  const search = searchParams.get("search") || "";
  const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom") as string) : undefined;
  const dateTo = searchParams.get("dateTo") ? new Date(searchParams.get("dateTo") as string) : undefined;
  const sortField = searchParams.get("sortField") || "created_at";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "desc";
  const operatorId = searchParams.get("operatorId") || undefined;

  return {
    courseType, setCourseType: (v: CourseType) => updateParam("courseType", v),
    branchId, setBranchId: (v: string | undefined) => updateParam("branchId", v),
    search, setSearch: (v: string) => updateParam("search", v),
    dateFrom, setDateFrom: (v: Date | undefined) => updateParam("dateFrom", v ? v.toISOString() : undefined),
    dateTo, setDateTo: (v: Date | undefined) => updateParam("dateTo", v ? v.toISOString() : undefined),
    sortField, sortDir,
    setSortField: (v: string) => updateParam("sortField", v),
    setSortDir: (v: "asc" | "desc") => updateParam("sortDir", v),
    operatorId, setOperatorId: (v: string | undefined) => updateParam("operatorId", v),
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
    }
  };
}
