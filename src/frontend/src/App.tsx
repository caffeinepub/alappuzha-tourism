import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import ChatbotWidget from "./components/ChatbotWidget";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage";
import BudgetPage from "./pages/BudgetPage";
import HomePage from "./pages/HomePage";
import ItineraryPage from "./pages/ItineraryPage";
import PlacesPage from "./pages/PlacesPage";

type Page = "home" | "places" | "itinerary" | "admin" | "budget";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const navigate = (page: Page) => setCurrentPage(page);

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar currentPage={currentPage} navigate={navigate} />
      <main>
        {currentPage === "home" && <HomePage navigate={navigate} />}
        {currentPage === "places" && <PlacesPage />}
        {currentPage === "itinerary" && <ItineraryPage />}
        {currentPage === "admin" && <AdminPage />}
        {currentPage === "budget" && <BudgetPage />}
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
      <ChatbotWidget navigate={navigate} />
    </div>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  );
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p className="font-display text-base text-foreground/70 mb-1">
          Alappuzha Tourism — Venice of the East
        </p>
        <p>
          © {year}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
