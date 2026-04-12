<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> a5d9669 (updated FM portal version)
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
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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
  const handleGoogleLogin = () => {
    setIsGoogleSubmitting(true);
    // Simulate Google OAuth
    setTimeout(() => {
      setIsGoogleSubmitting(false);
      navigate("/");
    }, 1500);
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden font-sans py-12 px-4">
      {/* Background with Dark Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed transition-transform duration-[20s]"
        style={{ backgroundImage: `url(${packagingImg})` }}
      />
      <div className="absolute inset-0 z-10 bg-[#0a1c12]/65" />

      {/* Login Card */}
      <div
        className="relative z-20 w-full max-w-[400px] bg-[#0f2316]/72 backdrop-blur-[24px] saturate-[1.4] border border-white/14 rounded-[20px] p-[28px_24px] md:p-[36px_40px] shadow-[0_32px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] animate-in fade-in zoom-in duration-[350ms] ease-[cubic-bezier(0.34,1.2,0.64,1)]"
      >

        {/* Logo and Greeting */}
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold tracking-tight inline-block mb-4 hover:opacity-80 transition-opacity">
            <span className="text-white">Fresh</span>
            <span className="text-[#7ec99a]">Sarura</span>
          </Link>
          <h1 className="text-white text-2xl font-serif font-bold mb-1">Welcome back</h1>
          <p className="text-white/65 text-[13px]">Log in to your account</p>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleSubmitting || isSubmitting}
          className="w-full h-[42px] mb-4 bg-white/10 border border-white/20 rounded-lg text-white text-[14px] flex items-center justify-center gap-3 transition-all hover:bg-white/16 active:scale-[0.98] z-30 relative disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGoogleSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span className="font-medium">Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative mb-4 flex items-center px-1">
          <div className="flex-grow border-t border-white/15"></div>
          <span className="mx-3 text-white/40 text-[11px] whitespace-nowrap">or continue with email</span>
          <div className="flex-grow border-t border-white/15"></div>
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
              <button type="button" className="text-[#7ec99a] text-[11.5px] hover:underline focus:outline-none">Forgot password?</button>
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
            <span>14 Export Markets</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
