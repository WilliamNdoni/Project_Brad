import { useEffect, useState } from "react";

export default function ClientPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/client/payments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Loading state
  if (loading) {
    return <p className="text-gray-500 text-sm">Loading payments...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Payments</h1>

      {/* 🔹 Empty state */}
      {payments.length === 0 ? (
        <div className="bg-white border rounded-xl p-6 text-center">
          <p className="text-gray-500 text-sm">
            No payments found yet.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Your payment history will appear here once you make a payment.
          </p>
        </div>
      ) : (
        // 🔹 Payments list
        payments.map((p) => (
          <div key={p.id} className="border p-4 mb-2 rounded">
            <p className="font-semibold">
              KES {Number(p.amount).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {p.method}
            </p>
          </div>
        ))
      )}
    </div>
  );
}