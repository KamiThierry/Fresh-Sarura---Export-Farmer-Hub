import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#top" },
  { label: "Our Products", href: "#produce" },
  { label: "For Buyers", href: "#buyers" },
  { label: "For Outgrowers", href: "#outgrowers" },
  { label: "Our Approach", href: "#approach" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useActiveSection(["top", "produce", "buyers", "outgrowers", "approach", "contact"]);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b">
      <div className="container flex items-center justify-between h-16">
        <button onClick={() => scrollTo("#top")} className="font-serif text-xl text-primary tracking-tight">
          Fresh Sarura
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => {
            const isActive = activeSection === l.href.substring(1);
            return (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative py-1",
                  isActive ? "text-green-700" : "text-muted-foreground hover:text-green-700"
                )}
              >
                {l.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-700 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            className="text-slate-600 font-medium hover:text-green-700 transition-colors duration-200 px-3 py-2 text-sm"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
          <Button 
            size="sm" 
            className="bg-green-700 hover:bg-green-800 text-white font-medium px-5 py-2 rounded-md shadow-sm transition-all duration-200 border-none"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b pb-4">
          <div className="container flex flex-col gap-3">
            {navLinks.map((l) => {
              const isActive = activeSection === l.href.substring(1);
              return (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className={cn(
                    "text-sm font-medium transition-all duration-200 text-left py-1 w-full border-l-2 pl-3",
                    isActive ? "text-green-700 border-green-700 bg-green-50/50" : "text-muted-foreground border-transparent"
                  )}
                >
                  {l.label}
                </button>
              );
            })}
            <div className="flex flex-col gap-2 pt-2 border-t mt-2">
              <button
                className="text-slate-600 font-medium hover:text-green-700 transition-colors duration-200 py-2 text-sm text-left"
                onClick={() => { setMobileOpen(false); navigate("/login"); }}
              >
                Log In
              </button>
              <Button 
                size="sm" 
                className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded-md shadow-sm transition-all duration-200"
                onClick={() => { setMobileOpen(false); navigate("/signup"); }}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
