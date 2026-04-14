import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TrainerLayout from "./pages/trainer/TrainerLayout";
import Dashboard from "./pages/trainer/Dashboard";
import Clients from "./pages/trainer/Clients";
import Pending from "./pages/trainer/Pending";
import Payments from "./pages/trainer/Payments";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/trainer" element={<TrainerLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="pending" element={<Pending />} />
          <Route path="payments" element={<Payments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}