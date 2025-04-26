import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Layout } from "./components/Layout";
import { WalletProvider } from "./contexts/WalletContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import FundingPlatform from "./components/FundingPlatform";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProjectDetails from "./components/ProjectDetails";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <Router>
          <Layout>
            <div className="flex flex-col w-full">
              <Routes>
                <Route path="/" element={<FundingPlatform />} />
                <Route path="/project/:projectId" element={<ProjectDetails />} />
              </Routes>
            </div>
          </Layout>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
