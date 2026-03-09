import { Button } from "@/components/ui/button";
import {
  Calculator,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

type Page = "home" | "places" | "itinerary" | "admin" | "budget";

interface NavbarProps {
  currentPage: Page;
  navigate: (page: Page) => void;
}

export default function Navbar({ currentPage, navigate }: NavbarProps) {
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-4)}`
    : "";

  const navLinks: {
    label: string;
    page: Page;
    ocid: string;
    icon?: React.ReactNode;
  }[] = [
    { label: "Home", page: "home", ocid: "nav.home_link" },
    { label: "Places", page: "places", ocid: "nav.places_link" },
    { label: "Itinerary", page: "itinerary", ocid: "nav.itinerary_link" },
    {
      label: "Budget",
      page: "budget",
      ocid: "nav.budget_link",
      icon: <Calculator className="w-3.5 h-3.5" />,
    },
  ];

  const handleNav = (page: Page) => {
    navigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-xs">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleNav("home")}
          className="flex items-center gap-2 group"
          aria-label="Alappuzha Tourism Home"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
            Alappuzha
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.page}
              type="button"
              data-ocid={link.ocid}
              onClick={() => handleNav(link.page)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentPage === link.page
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
          {isAdmin && (
            <button
              type="button"
              data-ocid="nav.admin_link"
              onClick={() => handleNav("admin")}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                currentPage === "admin"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </nav>

        {/* Right: Auth */}
        <div className="flex items-center gap-2">
          {isInitializing ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                {shortPrincipal}
              </span>
              <Button
                data-ocid="nav.logout_button"
                variant="outline"
                size="sm"
                onClick={clear}
                className="gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:block">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              data-ocid="nav.login_button"
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="gap-1.5 bg-primary hover:bg-primary/90"
            >
              {isLoggingIn ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5" />
              )}
              Login
            </Button>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <button
              key={link.page}
              type="button"
              data-ocid={link.ocid}
              onClick={() => handleNav(link.page)}
              className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                currentPage === link.page
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
          {isAdmin && (
            <button
              type="button"
              data-ocid="nav.admin_link"
              onClick={() => handleNav("admin")}
              className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                currentPage === "admin"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          )}
        </div>
      )}
    </header>
  );
}
