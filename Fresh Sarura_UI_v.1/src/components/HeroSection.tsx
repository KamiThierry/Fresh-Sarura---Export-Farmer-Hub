import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section id="top" className="relative flex items-center overflow-hidden pt-16"
      style={{ backgroundColor: "#f5f0e8", minHeight: "88vh" }}>

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #bbf7d0 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #86efac 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

      <div className="relative z-10 w-full px-6 md:px-10 lg:px-10 py-24 md:py-32">
        <div className="max-w-2xl">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-700/20 mb-8"
            style={{ backgroundColor: "rgba(21, 128, 61, 0.08)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
            <span className="text-green-700 text-xs font-semibold tracking-wider uppercase">
              Presented by Garden Fresh Rwanda Ltd
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
            style={{ color: "#14532d" }}>
            From Farm to Flight,{" "}
            <span style={{ color: "#ca8a04" }}>Every Step Tracked.</span>
          </h1>

          {/* Subtext */}
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-10">
            Fresh Sarura connects farmers, production managers, quality control,
            and logistics in one unified platform — built for Rwanda's premium
            horticulture export chain.
          </p>

          {/* Single CTA */}
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center px-10 h-14 rounded-xl font-bold text-lg text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
            style={{ backgroundColor: "#15803d" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#166534")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#15803d")}>
            Get Started →
          </button>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
