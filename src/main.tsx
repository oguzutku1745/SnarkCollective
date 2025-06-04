import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Layout } from "./components/Layout";
import { WalletProvider } from "./contexts/WalletContext";
import { AleoProvider } from "./contexts/AleoContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import FundingPlatform from "./components/FundingPlatform";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProjectDetails from "./components/ProjectDetails";
import AdminPanel from "./components/AdminPanel";
import SubmitProject from "./components/SubmitProject";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <AleoProvider>
          <Router>
        <Layout>
              <div className="flex flex-col w-full">
                <Routes>
                  <Route path="/" element={<FundingPlatform />} />
                  <Route path="/project/:projectKey" element={<ProjectDetails />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/submit" element={<SubmitProject />} />
                </Routes>
          </div>
        </Layout>
          </Router>
        </AleoProvider>
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
