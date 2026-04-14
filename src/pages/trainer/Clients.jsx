import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/trainer/clients`,
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

      setClients((prev) => prev.filter((c) => c.id !== clientUserId));
    } catch (err) {
      alert(err.message);
    }
  };

  const getPaymentStatus = (client) => {
    if (!client.due_date) return { label: "No payments", color: "gray" };

    const daysLeft = Math.ceil(
      (new Date(client.due_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) return { label: "Overdue", color: "red" };
    if (daysLeft <= 3) return { label: `Due in ${daysLeft} days`, color: "yellow" };
    return { label: `Due in ${daysLeft} days`, color: "green" };
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
        <h1 className="text-2xl font-bold text-gray-900">Active Clients</h1>
        <p className="text-sm text-gray-500 mt-1">
          {clients.length} active client{clients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No active clients yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const status = getPaymentStatus(client);
            const colorMap = {
              red: "text-red-600 bg-red-50 border-red-200",
              yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
              green: "text-green-600 bg-green-50 border-green-200",
              gray: "text-gray-600 bg-gray-50 border-gray-200",
            };

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
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
                  <div className="text-right space-y-2">
                    <span
                      className={`text-xs font-semibold border px-3 py-1 rounded-full ${colorMap[status.color]}`}
                    >
                      {status.label}
                    </span>
                    <p className="text-xs text-gray-400 capitalize">
                      {client.plan_type} plan
                    </p>
                  </div>
                </div>

                {/* payment info */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Last payment</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {client.amount
                        ? `KES ${Number(client.amount).toLocaleString()}`
                        : "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Paid on</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {client.paid_date
                        ? new Date(client.paid_date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Due date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {client.due_date
                        ? new Date(client.due_date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* actions */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      navigate(`/trainer/clients/${client.client_id}`)
                    }
                    className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl text-sm font-semibold transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeactivate(client.id)}
                    className="flex-1 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}