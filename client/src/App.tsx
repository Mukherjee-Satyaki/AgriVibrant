import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import HomePage from "@/pages/home";
import MarketplacePage from "@/pages/marketplace";
import BiddingPage from "@/pages/bidding";
import ChatbotPage from "@/pages/chatbot";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/marketplace" component={MarketplacePage} />
          <Route path="/bidding">
            {() => (
              <ProtectedRoute>
                <BiddingPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/chatbot" component={ChatbotPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
