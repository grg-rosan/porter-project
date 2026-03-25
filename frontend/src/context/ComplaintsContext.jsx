import { createContext, useContext, useState } from "react";

const ComplaintsContext = createContext(null);

const MOCK_COMPLAINTS = [
  { id: 1, from: "Rosan Gurung",   against: "Bikash Thapa",    role: "rider",    reason: "Rude behavior during trip",         status: "open",     createdAt: "2025-07-01", blocked: false },
  { id: 2, from: "Sita Rai",       against: "Suman Karki",     role: "rider",    reason: "Took longer route intentionally",   status: "open",     createdAt: "2025-07-02", blocked: false },
  { id: 3, from: "Dipesh Maharjan",against: "Anita Tamang",    role: "customer", reason: "Cancelled 3 times in a row",        status: "resolved", createdAt: "2025-06-29", blocked: true  },
  { id: 4, from: "Priya Shrestha", against: "Roshan Gurung",   role: "rider",    reason: "Overcharged fare",                  status: "open",     createdAt: "2025-07-03", blocked: false },
  { id: 5, from: "Admin",          against: "Unknown User #5", role: "customer", reason: "Fraudulent payment attempt",        status: "resolved", createdAt: "2025-06-25", blocked: true  },
];

export function ComplaintsProvider({ children }) {
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);

  const resolveComplaint = (id) =>
    setComplaints((prev) => prev.map((c) => c.id === id ? { ...c, status: "resolved" } : c));

  const toggleBlock = (id) =>
    setComplaints((prev) => prev.map((c) => c.id === id ? { ...c, blocked: !c.blocked } : c));

  return (
    <ComplaintsContext.Provider value={{ complaints, resolveComplaint, toggleBlock }}>
      {children}
    </ComplaintsContext.Provider>
  );
}

export const useComplaints = () => useContext(ComplaintsContext);