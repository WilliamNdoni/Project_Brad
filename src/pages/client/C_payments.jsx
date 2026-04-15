import { useEffect, useState } from "react";

export default function ClientPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState("mpesa");
  const [stkPending, setStkPending] = useState(false);
  const [form, setForm] = useState({ amount: "", phone: "" });

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/client/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (method === "mpesa") {
        // Step 1: trigger STK push
        const res = await fetch(`${import.meta.env.VITE_API_URL}/client/payments/stk`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ amount: form.amount, phone: form.phone }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // Step 2: poll for confirmation
        setStkPending(true);
        pollPaymentStatus(data.checkoutRequestId, token);
      } else {
        // cash — just notify trainer
        const res = await fetch(`${import.meta.env.VITE_API_URL}/client/payments/cash-request`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ amount: form.amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        alert("Cash payment request sent to your trainer.");
        setShowForm(false);
        setForm({ amount: "", phone: "" });
        await fetchPayments();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pollPaymentStatus = (checkoutRequestId, token) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/client/payments/stk/status/${checkoutRequestId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();

        if (data.status === "completed") {
          clearInterval(interval);
          setStkPending(false);
          setShowForm(false);
          setForm({ amount: "", phone: "" });
          await fetchPayments();
        } else if (data.status === "failed") {
          clearInterval(interval);
          setStkPending(false);
          alert("M-Pesa payment failed or was cancelled.");
        }
        // if "pending", keep polling
      } catch {
        clearInterval(interval);
        setStkPending(false);
      }
    }, 3000); // poll every 3 seconds

    // stop after 2 minutes
    setTimeout(() => {
      clearInterval(interval);
      setStkPending(false);
    }, 120000);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Your payment history and billing</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          + Pay Now
        </button>
      </div>

      {/* payment form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Make a payment</h2>

          {stkPending ? (
            <div className="text-center py-8">
              <p className="text-sm font-semibold text-gray-700">STK push sent to {form.phone}</p>
              <p className="text-xs text-gray-400 mt-2">Enter your M-Pesa PIN on your phone to complete payment...</p>
              <div className="mt-4 text-xs text-gray-400 animate-pulse">Waiting for confirmation...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* method selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Payment method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["mpesa", "cash"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-colors
                        ${method === m && m === "mpesa"
                          ? "border-green-400 bg-green-50 text-green-700"
                          : method === m && m === "cash"
                          ? "border-blue-400 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                      {m === "mpesa" ? "M-Pesa" : "Cash"}
                    </button>
                  ))}
                </div>
              </div>

              {/* phone — mpesa only */}
              {method === "mpesa" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    M-Pesa number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    placeholder="07XXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">STK push will be sent to this number</p>
                </div>
              )}

              {/* amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Amount (KES)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  placeholder="3000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {submitting ? "Processing..." : method === "mpesa" ? "Send STK Push" : "Request Cash Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* payments list */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No payments recorded yet</p>
          <p className="text-xs text-gray-300 mt-2">Your payment history will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid on</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    KES {Number(p.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border
                      ${p.method === "mpesa"
                        ? "text-green-600 bg-green-50 border-green-200"
                        : "text-blue-600 bg-blue-50 border-blue-200"
                      }`}>
                      {p.method === "mpesa" ? "M-Pesa" : "Cash"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border
                      ${p.status === "completed"
                        ? "text-green-600 bg-green-50 border-green-200"
                        : "text-amber-600 bg-amber-50 border-amber-200"
                      }`}>
                      {p.status === "completed" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {p.paid_date ? new Date(p.paid_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {new Date(p.due_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}