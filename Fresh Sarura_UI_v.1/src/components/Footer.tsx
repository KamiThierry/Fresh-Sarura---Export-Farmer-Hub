const Footer = () => (
  <footer className="border-t py-12">
    <div className="container">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
        <div className="text-center md:text-left space-y-1">
          <span className="font-serif text-lg text-foreground">Fresh Sarura</span>
          <p>Kigali, Rwanda &middot; exports@freshsarura.com</p>
        </div>
        <p className="text-center">NAEB Registered &middot; Export Compliant</p>
        <p>&copy; 2026 Fresh Sarura. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
