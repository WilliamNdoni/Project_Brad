import { useEffect, useState } from "react";

export default function ClientDashboard() {
  const [data, setData] = useState(null);
  const [due, setDue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("token");

      const [dashboardRes, dueRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/client/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/client/due-date`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dashboardData = await dashboardRes.json();
      const dueData = await dueRes.json();

      setData(dashboardData);
      setDue(dueData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const { client, latestPayment } = data;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">

        {/* Client Info */}
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Plan</p>
          <p className="font-bold">{client.plan_type}</p>
        </div>

        {/* Last Payment */}
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Last Payment</p>
          <p className="font-bold">
            {latestPayment ? `KES ${latestPayment.amount}` : "N/A"}
          </p>
        </div>

        {/* Due Date */}
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Next Due</p>

          <p
            className={`font-bold ${
              due?.isOverdue ? "text-red-500" : "text-green-600"
            }`}
          >
            {due?.dueDate
              ? new Date(due.dueDate).toLocaleDateString()
              : "N/A"}
          </p>

          {due?.daysLeft !== null && (
            <p className="text-xs text-gray-500">
              {due.isOverdue
                ? `${Math.abs(due.daysLeft)} days overdue`
                : `${due.daysLeft} days left`}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}