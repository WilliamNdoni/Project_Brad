import { useEffect, useState } from "react";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/trainer/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  const cards = [
    {
      label: "Active Clients",
      value: summary.activeClients,
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    {
      label: "Pending Approval",
      value: summary.pendingClients,
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    {
      label: "Overdue Clients",
      value: summary.overdueClients,
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    {
      label: "Total Revenue",
      value: `KES ${Number(summary.totalRevenue).toLocaleString()}`,
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
  ];

  return (
    <div>
      {/* header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, Brad. Here's your overview.
        </p>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} ${card.border} border rounded-2xl p-5`}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {card.label}
            </p>
            <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* quick info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Info</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <p className="text-sm text-gray-600">Pending clients need your approval</p>
            <span className="text-sm font-semibold text-yellow-600">
              {summary.pendingClients} pending
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <p className="text-sm text-gray-600">Clients with overdue payments</p>
            <span className="text-sm font-semibold text-red-600">
              {summary.overdueClients} overdue
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <p className="text-sm text-gray-600">Total active clients</p>
            <span className="text-sm font-semibold text-green-600">
              {summary.activeClients} active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}