import { useState } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import ListUsers from "./scenes/listUserScreen";
import ListLockedUsers from "./scenes/lockAccountUsers";
import PendingDrivers from "./scenes/pendingDriversListScreen";
import DriverReviews from "./scenes/listFeedbackScreen";
import Bar from "./scenes/rideStatisticScreen";
import PriceService from "./scenes/servicePriceManagementScreen";
import Line from "./scenes/revenueStatisticScreen";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import LoginPage from "./scenes/loginPageScreen";
import { AuthProvider, useAuth } from "./AuthContext"; // Import AuthProvider và useAuth
import TopbarGlobal from "./scenes/global/TopbarGlobal";
import VoucherList from "./scenes/discountManagementScreen";
import "leaflet/dist/leaflet.css";

function AppContent() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [view, setView] = useState("drivers"); // State to toggle between drivers and customers

  return (
    <ColorModeContext.Provider value={colorMode}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ display: "flex" }}>
            {token && <Sidebar isSidebar={isSidebar} setView={setView} />}
            <div style={{ flexGrow: 1 }}>
              {token && (
                <>
                  <TopbarGlobal />
                </>
              )}
              <Routes>
                {token ? (
                  <>
                    <Route
                      path="/dashboard"
                      element={
                        <Dashboard
                          searchQuery={searchQuery}
                          searchResults={searchResults}
                        />
                      }
                    />
                    <Route
                      path="/listUsers"
                      element={
                        <ListUsers
                          searchQuery={searchQuery}
                          searchResults={searchResults}
                        />
                      }
                    />
                    <Route
                      path="/pendingDrivers"
                      element={
                        <PendingDrivers
                          searchQuery={searchQuery}
                          searchResults={searchResults}
                        />
                      }
                    />
                    <Route
                      path="/listLockedUsers"
                      element={
                        <ListLockedUsers
                          searchQuery={searchQuery}
                          searchResults={searchResults}
                        />
                      }
                    />
                    <Route
                      path="/getAllDriversWithReviews"
                      element={
                        <DriverReviews
                          searchQuery={searchQuery}
                          searchResults={searchResults}
                        />
                      }
                    />

                    <Route path="/voucher" element={<VoucherList />} />
                    <Route path="/priceService" element={<PriceService />} />
                    <Route path="/bar" element={<Bar />} />
                    <Route path="/line" element={<Line />} />
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
