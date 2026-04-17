import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_TABS = [
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "overdue", label: "Overdue" }, // 🔥 replaced pending
];

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const navigate = useNavigate();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        status: activeTab,
        search: debouncedSearch,
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/trainer/clients?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDeactivate = async (clientUserId) => {
    if (!confirm("Are you sure you want to deactivate this client?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/trainer/clients/deactivate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ clientUserId }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setClients((prev) =>
        prev.filter((c) => c.client_id !== clientUserId)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleActivate = async (clientUserId) => {
    if (!confirm("Reactivate this client?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/trainer/clients/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ clientUserId }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setClients((prev) =>
        prev.filter((c) => c.client_id !== clientUserId)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // 🔥 improved payment status (includes overdue fallback safety)
  const getPaymentStatus = (client) => {
    if (!client.due_date) return { label: "No payments", color: "gray" };

    const daysLeft = Math.ceil(
      (new Date(client.due_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) return { label: "Overdue", color: "red" };
    if (daysLeft <= 3) return { label: `Due in ${daysLeft}d`, color: "yellow" };
    return { label: `Due in ${daysLeft}d`, color: "green" };
  };

  const initials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const badgeColors = {
    red: "text-red-600 bg-red-50 border-red-200",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
    green: "text-green-600 bg-green-50 border-green-200",
    gray: "text-gray-500 bg-gray-50 border-gray-200",
  };

  const avatarColors = [
    "bg-red-100 text-red-600",
    "bg-blue-100 text-blue-600",
    "bg-emerald-100 text-emerald-600",
    "bg-purple-100 text-purple-600",
    "bg-orange-100 text-orange-600",
  ];

  const getAvatarColor = (name = "") => {
    const idx = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {loading
            ? "Loading..."
            : `${clients.length} ${activeTab} client${
                clients.length !== 1 ? "s" : ""
              }`}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition"
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-100 rounded w-2/5" />
                  <div className="h-3 bg-gray-100 rounded w-3/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={fetchClients}
            className="mt-2 text-sm text-red-600 font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">
            {search
              ? `No ${activeTab} clients matching "${search}"`
              : `No ${activeTab} clients`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => {
            const status = getPaymentStatus(client);
            const isInactive = client.status === "inactive";

            // 🔥 frontend safety override for overdue tab
            const isOverdue =
              client.due_date &&
              new Date(client.due_date) < new Date() &&
              client.status === "active";

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* Top row */}
                <div className="p-4 flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(
                      client.full_name
                    )}`}
                  >
                    {initials(client.full_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {client.full_name}
                      </p>

                      <span
                        className={`text-xs font-semibold border px-2 py-0.5 rounded-full shrink-0 ${
                          isOverdue
                            ? badgeColors.red
                            : badgeColors[status.color]
                        }`}
                      >
                        {isOverdue ? "Overdue" : status.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {client.email}
                    </p>

                    {client.phone && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {client.phone}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-0.5 capitalize">
                      {client.plan_type} plan
                    </p>
                  </div>
                </div>

                {/* Payment row */}
                <div className="grid grid-cols-3 gap-2 px-4 pb-3 border-t border-gray-50 pt-3">
                  <div>
                    <p className="text-xs text-gray-400">Last paid</p>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">
                      {client.amount
                        ? `KES ${Number(client.amount).toLocaleString()}`
                        : "None"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Paid on</p>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">
                      {client.paid_date
                        ? new Date(client.paid_date).toLocaleDateString(
                            "en-KE",
                            { day: "numeric", month: "short" }
                          )
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Due</p>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">
                      {client.due_date
                        ? new Date(client.due_date).toLocaleDateString(
                            "en-KE",
                            { day: "numeric", month: "short" }
                          )
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-gray-100">
                  <button
                    onClick={() =>
                      navigate(`/trainer/clients/${client.client_id}`)
                    }
                    className="flex-1 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-100"
                  >
                    View Details
                  </button>

                  {client.status === "active" && (
                    <button
                      onClick={() => handleDeactivate(client.client_id)}
                      className="flex-1 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Deactivate
                    </button>
                  )}

                  {client.status === "inactive" && (
                    <button
                      onClick={() => handleActivate(client.client_id)}
                      className="flex-1 py-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
