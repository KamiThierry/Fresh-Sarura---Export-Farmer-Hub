import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import packagingImg from "@/assets/packaging.webp";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name: "email" | "password", value: string) => {
    let error = "";
    if (!value) {
      error = "This field is required";
    } else if (name === "email" && !emailRegex.test(value)) {
      error = "Please enter a valid email address";
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (name: "email" | "password") => {
    validateField(name, name === "email" ? email : password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateField("email", email);
    const isPasswordValid = validateField("password", password);

    if (isEmailValid && isPasswordValid) {
      setIsSubmitting(true);
      try {
        const data = await api.post('/auth/login', { email, password });

        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        const role = data.user.role;
        if (role === 'production_manager') navigate('/pm');
        else if (role === 'farm_manager') navigate('/farm-manager');
        else if (role === 'admin') navigate('/admin');
        else if (role === 'logistic_officer') navigate('/logistics');
        else if (role === 'quality_officer') navigate('/qc');
        else navigate('/');

      } catch (error: any) {
        setErrors({ email: error.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden font-sans py-12 px-4">
      {/* Background with Dark Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed transition-transform duration-[20s]"
        style={{ backgroundImage: `url(${packagingImg})` }}
      />
      <div className="absolute inset-0 z-10 bg-[#0a1c12]/65" />

      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-30 inline-flex items-center gap-1.5 text-white/85 hover:text-white text-[13px] font-medium transition-colors group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="transition-transform group-hover:-translate-x-0.5 duration-200">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to Home
      </Link>

      {/* Login Card */}
      <div
        className="relative z-20 w-full max-w-[400px] bg-[#0f2316]/72 backdrop-blur-[24px] saturate-[1.4] border border-white/14 rounded-[20px] p-[28px_24px] md:p-[36px_40px] shadow-[0_32px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] animate-in fade-in zoom-in duration-[350ms] ease-[cubic-bezier(0.34,1.2,0.64,1)]"
      >

        {/* Logo and Greeting */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4 hover:opacity-80 transition-opacity flex flex-col items-center">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-white">Fresh</span>
              <span className="text-[#7ec99a]">Sarura</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 tracking-[1.5px] uppercase mt-0.5">Exports & Farmer Hub</span>
          </Link>
          <h1 className="text-white text-2xl font-serif font-bold mb-1">Welcome back</h1>
          <p className="text-white/65 text-[13px]">Log in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-[14px] relative z-30">
          <div className="relative">
            <label htmlFor="email" className="block text-white/60 text-[12px] font-medium mb-[5px] ml-1">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              className={cn(
                "w-full h-[42px] bg-white/10 border border-white/20 rounded-lg px-4 text-white text-[14px] placeholder:text-white/38 outline-none transition-all duration-200 focus:border-[#7ec99a]/70 focus:ring-[3px] focus:ring-[#7ec99a]/12",
                errors.email && "border-red-500/80 focus:border-red-500/80 focus:ring-red-500/12 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
              )}
            />
            {errors.email && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.email}</p>}
          </div>

          <div className="relative">
            <div className="flex justify-between items-center ml-1 mb-[5px]">
              <label htmlFor="password" className="text-white/60 text-[12px] font-medium">Password</label>
              <Link to="/forgot-password" className="text-[#7ec99a] text-[11.5px] hover:underline focus:outline-none">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                className={cn(
                  "w-full h-[42px] bg-white/10 border border-white/20 rounded-lg pl-4 pr-12 text-white text-[14px] placeholder:text-white/38 outline-none transition-all duration-200 focus:border-[#7ec99a]/70 focus:ring-[3px] focus:ring-[#7ec99a]/12",
                  errors.password && "border-red-500/80 focus:border-red-500/80 focus:ring-red-500/12 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-white/45 hover:text-white transition-colors z-40"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[44px] mt-2 bg-[#2d6a45] hover:bg-[#1a3d2b] text-white text-[14.5px] font-medium rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center transform hover:-translate-y-px"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Login →"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-5 relative z-30">
          <p className="text-white/55 text-[13px]">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#7ec99a] font-medium hover:underline">
              Sign Up
            </Link>
          </p>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-1.5 text-[#c9a84c]/70 text-[9.5px] font-bold uppercase tracking-[1.2px] mt-5">
            <span>GlobalG.A.P. Certified</span>
            <span className="opacity-40">·</span>
            <span>500+ Outgrowers</span>
            <span className="opacity-40">·</span>
            <span>4 Export Markets</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
