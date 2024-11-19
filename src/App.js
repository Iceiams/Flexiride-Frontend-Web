import { useState } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import ListUsers from "./scenes/listUser";
import ListLockedUsers from "./scenes/lockAccountUsers";
import PendingDrivers from "./scenes/pendingDrivers";
import DriverReviews from "./scenes/listFeedback";
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
import TopbarGlobal from "./scenes/global/TopbarGlobal";
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
