import { BrowserRouter, Routes, Route } from "react-router-dom";
import LockScreen from "./pages/LockScreen";
import AppShell from "./app/AppShell";
import Home from "./pages/Home";
import Race from "./pages/Race";
import Strategy from "./pages/Strategy";
import ProfileSetup from "./pages/ProfileSetup";
import StrategyDetail from "./pages/StrategyDetail";

import ErrorBoundary from "./components/ErrorBoundary";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LockScreen />} />

        <Route path="/app" element={<AppShell />}>
          <Route path="home" element={<Home />} />
          <Route path="race" element={<ErrorBoundary><Race /></ErrorBoundary>} />
          <Route path="strategy" element={<Strategy />} />
          <Route path="strategy/:id" element={<StrategyDetail />} />
        </Route>
        <Route path="/profile-setup" element={<ProfileSetup />} />
</Routes>
    </BrowserRouter>
  );
}