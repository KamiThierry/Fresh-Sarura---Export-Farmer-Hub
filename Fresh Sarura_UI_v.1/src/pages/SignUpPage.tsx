import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import Toast from "@/portals/shared/component/Toast";
import packagingImg from "@/assets/packaging.webp";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  const validateField = (name: string, value: string) => {
    let error = "";
    if (!value) {
      error = "This field is required";
    } else if (name === "email" && !emailRegex.test(value)) {
      error = "Please enter a valid email address";
    } else if (name === "phone" && !phoneRegex.test(value)) {
      error = "Please enter a valid phone number";
    } else if (name === "password" && value.length < 6) {
      error = "Password must be at least 6 characters";
    } else if (name === "confirmPassword" && value !== formData.password) {
      error = "Passwords do not match";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) validateField(name, value);
  };

  const handleBlur = (name: string) => {
    validateField(name, formData[name as keyof typeof formData]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
      if (!formData[key]) {
        newErrors[key] = "This field is required";
        isValid = false;
      }
    });

    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsSubmitting(true);
      try {
        await api.post('/auth/register', {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
        });
        setShowToast(true);
        setIsSuccess(true);
      } catch (error: any) {
        setErrors({ fullName: error.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSignUp = () => {
    setIsGoogleSubmitting(true);
    setTimeout(() => {
      setIsGoogleSubmitting(false);
      setShowToast(true);
      setIsSuccess(true);
    }, 1500);
  };

  // ── Success Screen ──────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden font-sans py-12 px-4">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${packagingImg})` }}
        />
        <div className="absolute inset-0 z-10 bg-[#0a1c12]/65" />
        <div className="relative z-20 w-full max-w-[400px] bg-[#0f2316]/72 backdrop-blur-[24px] border border-white/14 rounded-[20px] p-[36px_40px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] animate-in zoom-in duration-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2d6a45] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(22,163,74,0.4)]">
              <CheckCircle2 className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Registration Received!</h2>
            <p className="text-white/75 leading-relaxed mb-8">
              Your account is pending admin approval. You will be notified once approved.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-[44px] bg-[#2d6a45] hover:bg-[#1a3d2b] text-white font-semibold rounded-lg transition-all active:scale-[0.98]"
            >
              Return to Login
            </button>
          </div>
        </div>

        {
          showToast && (
            <Toast
              message="Account Created Successfully"
              subtitle="Your registration is now pending admin approval"
              onClose={() => setShowToast(false)}
            />
          )
        }
      </div >
    );
  }

  // ── Main Form ───────────────────────────────────────────────
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden font-sans py-12 px-4">
      {/* Same background as login */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed transition-transform duration-[20s]"
        style={{ backgroundImage: `url(${packagingImg})` }}
      />
      <div className="absolute inset-0 z-10 bg-[#0a1c12]/65" />

      {/* Card — same width, radius, blur as login */}
      <div className="relative z-20 w-full max-w-[400px] bg-[#0f2316]/72 backdrop-blur-[24px] saturate-[1.4] border border-white/14 rounded-[20px] p-[28px_24px] md:p-[36px_40px] shadow-[0_32px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] animate-in fade-in zoom-in duration-[350ms] ease-[cubic-bezier(0.34,1.2,0.64,1)]">

        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold tracking-tight inline-block mb-4 hover:opacity-80 transition-opacity">
            <span className="text-white">Fresh</span>
            <span className="text-[#7ec99a]">Sarura</span>
          </Link>
          <h1 className="text-white text-2xl font-serif font-bold mb-1">Create Account</h1>
          <p className="text-white/65 text-[13px]">Join our agricultural community today</p>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleSubmitting || isSubmitting}
          className="w-full h-[42px] mb-4 bg-white/10 border border-white/20 rounded-lg text-white text-[14px] flex items-center justify-center gap-3 transition-all hover:bg-white/16 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
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
          <span className="mx-3 text-white/40 text-[11px] whitespace-nowrap">or sign up with email</span>
          <div className="flex-grow border-t border-white/15"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-[14px]">

          {/* Full Name */}
          <div>
            <label className="block text-white/60 text-[12px] font-medium mb-[5px] ml-1">Full Name</label>
            <input
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              onBlur={() => handleBlur("fullName")}
              className={cn(
                "w-full h-[42px] bg-white/10 border border-white/20 rounded-lg px-4 text-white text-[14px] placeholder:text-white/38 outline-none transition-all duration-200 focus:border-[#7ec99a]/70 focus:ring-[3px] focus:ring-[#7ec99a]/12",
                errors.fullName && "border-red-500/80"
              )}
            />
            {errors.fullName && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.fullName}</p>}
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/60 text-[12px] font-medium mb-[5px] ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur("email")}
                className={cn(
                  "w-full h-[42px] bg-white/10 border border-white/20 rounded-lg px-4 text-white text-[14px] placeholder:text-white/38 outline-none transition-all duration-200 focus:border-[#7ec99a]/70 focus:ring-[3px] focus:ring-[#7ec99a]/12",
                  errors.email && "border-red-500/80"
                )}
              />
              {errors.email && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-white/60 text-[12px] font-medium mb-[5px] ml-1">Phone Number</label>
              <input
                name="phone"
                type="tel"
                placeholder="+250 788 000 000"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={() => handleBlur("phone")}
                className={cn(
                  "w-full h-[42px] bg-white/10 border border-white/20 rounded-lg px-4 text-white text-[14px] placeholder:text-white/38 outline-none transition-all duration-200 focus:border-[#7ec99a]/70 focus:ring-[3px] focus:ring-[#7ec99a]/12",
                  errors.phone && "border-red-500/80"
                )}
              />
              {errors.phone && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-white/60 text-[12px] font-medium mb-[5px] ml-1">Your Role</label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                onBlur={() => handleBlur("role")}
                className={cn(
                  "w-full h-[42px] bg-white/10 border border-white/20 rounded-lg px-4 text-white text-[14px] outline-none transition-all appearance-none cursor-pointer focus:border-[#7ec99a]/70 focus:ring-[3px] focus:ring-[#7ec99a]/12",
                  errors.role && "border-red-500/80",
                  !formData.role && "text-white/38"
                )}
              >
                <option value="" disabled className="bg-[#0f2316]">Select your role</option>
                <option value="production_manager" className="bg-[#0f2316] text-white">Production Manager</option>
                <option value="farm_manager" className="bg-[#0f2316] text-white">Farm Manager</option>
                <option value="logistic_officer" className="bg-[#0f2316] text-white">Logistic Officer</option>
                <option value="quality_officer" className="bg-[#0f2316] text-white">Quality Officer</option>

              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2.5 4.5L6 8L9.5 4.5" />
                </svg>
              </div>
            </div>
            {errors.role && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.role}</p>}
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/60 text-[12px] font-medium mb-[5px] ml-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("password")}
                  className={cn(
                    "w-full h-[42px] bg-white/10 border border-white/20 rounded-lg pl-4 pr-10 text-white text-[14px] placeholder:text-white/38 outline-none transition-all duration-200 focus:border-[#7ec99a]/70 focus:ring-[3px] focus:ring-[#7ec99a]/12",
                    errors.password && "border-red-500/80"
                  )}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-white/45 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-white/60 text-[12px] font-medium mb-[5px] ml-1">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={cn(
                    "w-full h-[42px] bg-white/10 border border-white/20 rounded-lg pl-4 pr-10 text-white text-[14px] placeholder:text-white/38 outline-none transition-all duration-200 focus:border-[#7ec99a]/70 focus:ring-[3px] focus:ring-[#7ec99a]/12",
                    errors.confirmPassword && "border-red-500/80"
                  )}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-white/45 hover:text-white transition-colors">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Submit Button — same style as login */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[44px] mt-2 bg-[#2d6a45] hover:bg-[#1a3d2b] text-white text-[14.5px] font-medium rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center transform hover:-translate-y-px"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Create Account →"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-5">
          <p className="text-white/55 text-[13px]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#7ec99a] font-medium hover:underline">Login</Link>
          </p>
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

export default SignUpPage;
