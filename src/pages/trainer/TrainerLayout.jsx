import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/trainer/dashboard", icon: "▣" },
  { label: "Clients", path: "/trainer/clients", icon: "◉" },
  { label: "Pending Approvals", path: "/trainer/pending", icon: "◎" },
  { label: "Payments / Transactions", path: "/trainer/payments", icon: "◈" },
];

export default function TrainerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="flex" style={{ minHeight: "100dvh" }}>

      {/* mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 flex flex-col
                    transition-transform duration-300 lg:translate-x-0
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          width: "240px",
          height: "100dvh",
          background: "linear-gradient(to bottom, #0a0a0a, #1a0000)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* logo */}
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <img
            src="/G7_logo.jpeg"
            alt="G7 logo"
            className="w-10 h-10 rounded-xl object-contain"
          />
          <div>
            <p className="font-bold text-white text-sm">GenerationIron7</p>
            <p className="text-xs text-red-400 uppercase tracking-widest">
              Trainer Portal
            </p>
          </div>
        </div>

        {/* nav items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                            text-sm font-medium transition-colors text-left
                            ${isActive
                              ? "bg-red-500 text-white"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
              >
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       text-sm font-medium text-gray-400 hover:bg-red-500/10
                       hover:text-red-400 transition-colors text-left"
          >
            <span style={{ fontSize: "16px" }}>⏻</span>
            Logout
          </button>
        </div>
      </aside>

      {/* spacer for sidebar on large screens */}
      <div className="hidden lg:block shrink-0" style={{ width: "240px" }} />

      {/* main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar — mobile only */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3
                           bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 text-xl font-bold"
          >
            ☰
          </button>
          <p className="font-bold text-gray-900 text-sm">GenerationIron7</p>
          <div className="w-6" />
        </header>

        {/* page content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>

      </div>
    </div>
  );
}