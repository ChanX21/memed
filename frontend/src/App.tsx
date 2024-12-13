import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "./pages/Home";
import CoinDetailPage from "./pages/Coin";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js?56";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <QueryClientProvider client={queryClient}>
          <Navbar />
          <div className="min-h-screen bg-background font-sans antialiased">
            <main className="container mx-auto py-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/coin/:tokenAddress"
                  element={<CoinDetailPage />}
                />
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
