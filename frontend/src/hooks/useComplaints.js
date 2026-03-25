import { useState } from "react";
import { useComplaints as useComplaintsCtx } from "../context/ComplaintsContext";

export function useComplaintsPanel() {
  const { complaints, resolveComplaint, toggleBlock } = useComplaintsCtx();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = complaints.filter((c) => {
    const matchFilter =
      filter === "all"      ? true :
      filter === "open"     ? c.status === "open" :
      filter === "resolved" ? c.status === "resolved" :
      filter === "blocked"  ? c.blocked : true;

    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.from.toLowerCase().includes(q) ||
      c.against.toLowerCase().includes(q) ||
      c.reason.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  return { filtered, filter, setFilter, search, setSearch, resolveComplaint, toggleBlock };
}