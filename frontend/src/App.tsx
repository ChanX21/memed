import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "./pages/Home";
import CoinDetailPage from "./pages/Coin";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Splash from "@/components/Splash";
import Battles from "@/pages/Battles";
import Leaderboard from "@/pages/Leaderboard";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js?56";
    document.head.appendChild(script);

    // Simulate loading time and hide splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Show splash screen for 2 seconds

    return () => {
      document.head.removeChild(script);
      clearTimeout(timer);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <QueryClientProvider client={queryClient}>
          {loading && <Splash />}
          <Navbar />
          <div className="min-h-screen bg-background font-sans antialiased">
            <main className="container mx-auto py-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/coin/:tokenAddress" element={<CoinDetailPage />} />
                <Route path="/battles" element={<Battles />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Routes>
            </main>
          </div>
          <Toaster />
        </QueryClientProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
