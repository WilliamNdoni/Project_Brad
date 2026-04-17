import { useEffect, useState } from "react";

export default function Pending() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(null);
  const [form, setForm] = useState({ planType: "monthly", firstDueDate: "" });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/trainer/clients/pending`,
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
  };

  const handleApprove = async (clientUserId) => {
    setApproving(clientUserId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/trainer/clients/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clientUserId,
            planType: form.planType || "monthly", // default to monthly if not set
            firstDueDate: form.firstDueDate || null, // null if not set
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setClients((prev) => prev.filter((c) => c.id !== clientUserId));
      setSelected(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setApproving(null);
    }
  };

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

  return (
    <div>
      {/* header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">
          {clients.length} client{clients.length !== 1 ? "s" : ""} awaiting your approval
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No pending clients at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              {/* client info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">
                      {client.full_name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{client.full_name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    <p className="text-sm text-gray-500">{client.phone}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
                  Pending
                </span>
              </div>

              {/* approve form */}
              {selected === client.id ? (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Plan type
                      </label>
                      <select
                        value={form.planType}
                        onChange={(e) =>
                          setForm({ ...form, planType: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-400"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        First due date
                        <span className="text-gray-400 font-normal ml-1">(optional)</span>
                      </label>
                      <input
                        type="date"
                        value={form.firstDueDate}
                        onChange={(e) =>
                          setForm({ ...form, firstDueDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-400"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Only fill in if client has already paid
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(client.id)}
                      disabled={approving === client.id}
                      className="flex-1 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      {approving === client.id ? "Approving..." : "Confirm Approval"}
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelected(client.id)
                    setForm({ planType: "monthly", firstDueDate: "" }) // reset form on open
                  }}
                  className="w-full py-2 border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl text-sm font-semibold transition-colors mt-2"
                >
                  Review & Approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}