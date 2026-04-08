import heroImg from "@/assets/farm.jpg";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const metrics = [
    { label: "Verified Outgrowers", value: "500+" },
    { label: "International Markets", value: "3" },
    { label: "Digital Traceability", value: "100%" },
  ];

  return (
    <section id="top" className="relative min-h-[90vh] flex items-center overflow-hidden">
      <img
        src={heroImg}
        alt="Rwandan avocado farm at sunrise with farmer tending crops"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      {/* Sophisticated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />

      <div className="container relative z-10 py-24 md:py-32">
        <div className="max-w-3xl">
          {/* Eyebrow Tagline */}
          <div className="space-y-2 mb-6">
            <span className="text-sm font-semibold tracking-wider text-green-400 uppercase block">
              RWANDA | PREMIUM HORTICULTURE
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Bridging Rwanda's Best Farms with Global Markets.
            </h1>
          </div>

          <p className="text-slate-200 text-lg md:text-xl leading-relaxed max-w-xl mb-10 opacity-90">
            We combine world-class agronomy with digital traceability to empower local outgrowers and deliver premium produce to international buyers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <Button size="lg" className="px-8 h-12 text-base font-semibold" onClick={() => scrollTo("#buyers")}>
              Request Premium Produce
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 text-base font-semibold bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-slate-900 transition-all font-medium"
              onClick={() => scrollTo("#approach")}
            >
              Explore Our Approach
            </Button>
          </div>

          {/* Social Proof / Metrics Bar */}
          <div className="flex flex-wrap gap-12 pt-8 border-t border-white/10">
            {metrics.map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="text-3xl font-bold text-white">{m.value}</div>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
