const stats = [
  { value: "6", label: "User Roles" },
  { value: "11", label: "Production Steps" },
  { value: "100%", label: "Traceability" },
  { value: "500+", label: "Verified Outgrowers" },
];

const StatsBar = () => (
  <section className="py-6 px-8 md:px-16 lg:px-24">
    <div className="rounded-2xl grid grid-cols-2 md:grid-cols-4"
      style={{ backgroundColor: "#e8f5e9", border: "1px solid #c8e6c9" }}>
      {stats.map((s, i) => (
        <div key={s.label}
          className={`flex flex-col items-center justify-center py-10 px-6 gap-1
            ${i < stats.length - 1 ? "border-r border-green-200/60" : ""}`}>
          <span className="text-4xl font-extrabold text-green-800">{s.value}</span>
          <span className="text-xs font-semibold tracking-widest text-green-600/80 uppercase text-center">{s.label}</span>
        </div>
      ))}
    </div>
  </section>
);

export default StatsBar;
