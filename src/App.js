import { useState } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import ListUsers from "./scenes/listUser";
import Invoices from "./scenes/invoices";
import PendingDrivers from "./scenes/pendingDrivers";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import LoginPage from "./scenes/loginPage";
import { AuthProvider, useAuth } from "./AuthContext"; // Import AuthProvider và useAuth

function AppContent() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const { token } = useAuth(); // Lấy token từ AuthContext

  return (
    <ColorModeContext.Provider value={colorMode}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ display: "flex" }}>
            {/* Chỉ hiển thị Sidebar nếu đã đăng nhập */}
            {token && <Sidebar isSidebar={isSidebar} />}
            <div style={{ flexGrow: 1 }}>
              {/* Topbar hiển thị phía trên */}
              {token && <Topbar setIsSidebar={setIsSidebar} />}
              <Routes>
                {token ? (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/listUsers" element={<ListUsers />} />
                    <Route
                      path="/pendingDrivers"
                      element={<PendingDrivers />}
                    />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/form" element={<Form />} />
                    <Route path="/bar" element={<Bar />} />
                    <Route path="/pie" element={<Pie />} />
                    <Route path="/line" element={<Line />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/geography" element={<Geography />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </>
                ) : (
                  <>
                    <Route path="/loginAdmin" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/loginAdmin" />} />
                  </>
                )}
              </Routes>
            </div>
          </div>
        </ThemeProvider>
      </BrowserRouter>
    </ColorModeContext.Provider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
