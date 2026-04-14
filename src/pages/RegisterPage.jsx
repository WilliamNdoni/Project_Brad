import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.phone.length < 10) {
      setError("Enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      navigate("/login");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full flex items-center justify-center py-6"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(to bottom right, #000000, #111827, #450a0a)",
      }}
    >
      <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-[400px] shadow-2xl">

        <div className="flex items-center gap-3 mb-6">
          <img
            src="/G7_logo.jpeg"
            alt="G7 logo"
            className="w-14 h-14 rounded-xl object-contain"
          />
          <div>
            <p className="font-bold text-gray-900 text-base">GenerationIron7</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Client Payment Portal
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Register to track your payments and sessions.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Phone number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="07XXXXXXXX"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Confirm password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors mt-2"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>

        <div className="flex items-center gap-2 my-4 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" />
          already have an account?
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl font-semibold text-sm transition-colors"
        >
          Sign in
        </button>

      </div>
    </div>
  );
}