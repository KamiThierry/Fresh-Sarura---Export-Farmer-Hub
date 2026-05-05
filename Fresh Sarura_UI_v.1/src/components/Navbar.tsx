import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";
import logo from "@/assets/sarura_logo_nav.png";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Your Team", href: "#for-your-team" },
  { label: "Production Chain", href: "#production-chain" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useActiveSection(["top", "how-it-works", "for-your-team", "production-chain", "contact"]);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href === "#top") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-100"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
      <div className="px-6 md:px-10 lg:px-10 flex items-center justify-between h-16">

        {/* Logo Section - Tailored to PM Portal */}
        <button onClick={() => scrollTo("#top")} className="flex items-center gap-2">
          <img src={logo} alt="Fresh Sarura Logo" className="h-8 w-auto object-contain" />
          <div className="flex flex-col items-start leading-tight">
            <span className="font-bold text-green-700 text-lg tracking-tight">Fresh Sarura</span>
            <span className="text-[10px] font-medium text-gray-500 tracking-tight">Export & Farmer Hub</span>
          </div>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => {
            const isActive = activeSection === l.href.substring(1);
            return (
              <button key={l.href} onClick={() => scrollTo(l.href)}
                className={cn("text-sm font-medium transition-all duration-200 relative py-1",
                  isActive ? "text-green-700" : "text-slate-600 hover:text-green-700")}>
                {l.label}
                {isActive && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-700 rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-slate-700" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-b border-gray-100 pb-4 bg-white">
          <div className="px-8 flex flex-col gap-3 pt-2">
            {navLinks.map((l) => {
              const isActive = activeSection === l.href.substring(1);
              return (
                <button key={l.href} onClick={() => scrollTo(l.href)}
                  className={cn("text-sm font-medium text-left py-1.5 pl-3 border-l-2 w-full",
                    isActive ? "text-green-700 border-green-700" : "text-slate-600 border-transparent")}>
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
