import { useEffect, useState } from "react";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i);
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterType, setFilterType] = useState("year");
  const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [revenueLoading, setRevenueLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch(`${import.meta.env.VITE_API_URL}/trainer/dashboard`, { headers });
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

  useEffect(() => {
    const fetchRevenue = async () => {
      setRevenueLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        let params = "";
        if (filterType === "year") {
          params = `period=year&value=${selectedYear}`;
        } else if (filterType === "quarter") {
          params = `period=quarter&value=${selectedYear}-${selectedQuarter}`;
        } else if (filterType === "month") {
          params = `period=month&value=${selectedYear}-${selectedMonth}`;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/trainer/dashboard/revenue-by-month?${params}`,
          { headers }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setRevenueData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setRevenueLoading(false);
      }
    };
    fetchRevenue();
  }, [filterType, selectedYear, selectedQuarter, selectedMonth]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  const cards = [
    { label: "Active Clients", value: summary.activeClients, bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    { label: "Pending Approval", value: summary.pendingClients, bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    { label: "Overdue Clients", value: summary.overdueClients, bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);
  const totalFiltered = revenueData.reduce((sum, d) => sum + d.revenue, 0);

  const getBarLabel = (month) => {
    if (filterType === "year") return month.split(" ")[0].slice(0, 1);
    if (filterType === "quarter") return month.split(" ")[0].slice(0, 3);
    return month;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, Brad. Here's your overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`${card.bg} ${card.border} border rounded-2xl p-5`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">

        {/* Chart Header */}
        <div className="flex flex-col gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Revenue</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Total: <span className="font-semibold text-blue-600">KES {totalFiltered.toLocaleString()}</span>
            </p>
          </div>

          {/* Filters — stacks on mobile, inline on sm+ */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter type tabs — full width on mobile */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium w-full sm:w-auto">
              {["year", "quarter", "month"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 sm:flex-none px-3 py-2 capitalize transition-colors ${
                    filterType === type
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Dropdowns row */}
            <div className="flex items-center gap-2">
              {/* Year — always visible */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {YEARS.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>

              {/* Quarter */}
              {filterType === "quarter" && (
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {QUARTERS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              )}

              {/* Month */}
              {filterType === "month" && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Chart Body */}
        {revenueLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400 text-sm">Loading chart...</p>
          </div>
        ) : revenueData.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400 text-sm">No revenue data for this period.</p>
          </div>
        ) : (
          <div className="flex items-end gap-1 sm:gap-2 h-48 pt-4">
            {revenueData.map((d) => {
              const heightPct = (d.revenue / maxRevenue) * 100;
              return (
                <div key={d.month} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="hidden group-hover:flex flex-col items-center absolute bottom-full mb-2 z-10 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                      <p className="font-semibold">{d.month}</p>
                      <p>KES {d.revenue.toLocaleString()}</p>
                    </div>
                    <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all duration-300 cursor-default"
                    style={{ height: `${heightPct}%`, minHeight: "4px" }}
                  />
                  {/* Label — shortened based on filter type */}
                  <p className="text-[10px] text-gray-400 mt-2 whitespace-nowrap">
                    {getBarLabel(d.month)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Info</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <p className="text-sm text-gray-600">Pending clients need your approval</p>
            <span className="text-sm font-semibold text-yellow-600 ml-4 shrink-0">{summary.pendingClients} pending</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <p className="text-sm text-gray-600">Clients with overdue payments</p>
            <span className="text-sm font-semibold text-red-600 ml-4 shrink-0">{summary.overdueClients} overdue</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <p className="text-sm text-gray-600">Total active clients</p>
            <span className="text-sm font-semibold text-green-600 ml-4 shrink-0">{summary.activeClients} active</span>
          </div>
        </div>
      </div>
    </div>
  );
}