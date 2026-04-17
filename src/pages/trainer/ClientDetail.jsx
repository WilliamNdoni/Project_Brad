import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logging, setLogging] = useState(false);
  const [amount, setAmount] = useState("");
  const [showForm, setShowForm] = useState(false);
  const statusColors = {
  active: "text-green-600",
  inactive: "text-gray-500",
  };


  useEffect(() => {
    fetchClient();
  }, []);

  const fetchClient = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [clientRes, paymentsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/trainer/clients/${clientId}`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/trainer/clients/${clientId}/payments`, { headers }),
      ]);

      const clientData = await clientRes.json();
      const paymentsData = await paymentsRes.json();

      if (!clientRes.ok) throw new Error(clientData.message);
      if (!paymentsRes.ok) throw new Error(paymentsData.message);

      setClient(clientData);
      setPayments(paymentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogCash = async () => {
    if (!amount || isNaN(amount)) return alert("Enter a valid amount");
    setLogging(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/trainer/payments/cash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clientId, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAmount("");
      setShowForm(false);
      fetchClient(); // refresh data
    } catch (err) {
      alert(err.message);
    } finally {
      setLogging(false);
    }
  };

  const getPaymentStatus = (dueDate) => {
    if (!dueDate) return { label: "No payments", color: "gray" };
    const daysLeft = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { label: "Overdue", color: "red" };
    if (daysLeft <= 3) return { label: `Due in ${daysLeft} days`, color: "yellow" };
    return { label: `Due in ${daysLeft} days`, color: "green" };
  };

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

  const status = getPaymentStatus(client.due_date);
  const colorMap = {
    red: "text-red-600 bg-red-50 border-red-200",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
    green: "text-green-600 bg-green-50 border-green-200",
    gray: "text-gray-600 bg-gray-50 border-gray-200",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate("/trainer/clients")}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.full_name}</h1>
          <p className="text-sm text-gray-500 mt-1">{client.email} · {client.phone}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Plan</p>
          <p className="text-xl font-bold text-gray-900 capitalize">{client.plan_type}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</p>
          <p className={`text-xl font-bold capitalize ${statusColors[client.status] || "text-gray-700"}`}>
            {client.status}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Last Paid</p>
          <p className="text-xl font-bold text-gray-900">
            {client.paid_date ? `KES ${Number(client.amount).toLocaleString()}` : "—"}
          </p>
        </div>
        <div className={`rounded-2xl border p-5 ${colorMap[status.color]}`}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">Payment</p>
          <p className="text-xl font-bold">{status.label}</p>
        </div>
      </div>

      {/* Log Cash Payment */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Log Cash Payment</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            {showForm ? "Cancel" : "+ Log Payment"}
          </button>
        </div>
        {showForm && (
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Amount (KES)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-400"
            />
            <button
              onClick={handleLogCash}
              disabled={logging}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {logging ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No payments recorded yet</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    KES {Number(payment.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{payment.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(payment.paid_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Due: {new Date(payment.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}