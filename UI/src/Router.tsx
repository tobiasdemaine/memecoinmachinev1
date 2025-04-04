import { Route, Routes } from "react-router-dom";
import { TokenPage } from "./pages/Token.page";
import { NewPage } from "./pages/New.page";
import { DashboardPage } from "./pages/Dashboard.page ";
import { WithdrawPage } from "./pages/Withdraw.page";

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/new" element={<NewPage />} />
      <Route path="/withdraw" element={<WithdrawPage />} />
      <Route path="/token/:id" element={<TokenPage />} />
    </Routes>
  );
}
