"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FormInput from "@/components/FormInput";

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    let newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Store token and user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      }));

      // Store token in cookie for middleware
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      setIsSuccess(true);
      
      // Redirect to dashboard after a short delay to show success state
      setTimeout(() => {
        router.push("/dashboard/overview");
      }, 1500);
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.fullName && formData.email && formData.password && formData.confirmPassword;

  return (
    <main className="min-h-screen bg-background relative selection:bg-accent-green/30 selection:text-white flex items-center justify-center p-6 py-12">
      {/* High-performance cinematic fade-in overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,rgba(0,0,0,1)_100%)]"
      />
      
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.05)_0%,transparent_60%)] pointer-events-none z-[-1]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-xl"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6 text-sm font-medium group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Brand */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="text-3xl font-bold tracking-tighter flex items-center group">
            <span className="text-white">Agri</span>
            <span className="text-accent-green drop-shadow-[0_0_10px_rgba(0,255,136,0.4)]">Go</span>
          </Link>
        </div>

        <div className="glass p-8 md:p-10 rounded-3xl relative overflow-hidden group">
          {/* Subtle inner highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Create your AgriGo account</h1>
            <p className="text-text-secondary text-sm md:text-base font-light max-w-md mx-auto">
              Start using climate-aware yield prediction and farming insights.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green mb-2">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white">Account Created!</h3>
                <p className="text-text-secondary text-sm mb-6 max-w-sm">
                  Welcome to AgriGo. Your account has been successfully registered.
                </p>
                <p className="text-text-secondary text-sm mb-4">Redirecting to your dashboard...</p>
                
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="flex flex-col gap-5"
              >
                {errors.form && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl text-center">
                    {errors.form}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-5">
                  <FormInput
                    id="fullName"
                    label="Full Name"
                    placeholder="John Doe"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    error={errors.fullName}
                  />
                  <FormInput
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput
                    id="password"
                    label="Password"
                    type="password"
                    placeholder="Min. 8 characters"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                  />
                  <FormInput
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="Retype password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="w-full bg-accent-green hover:bg-accent-green-hover disabled:bg-white/5 disabled:text-text-secondary disabled:cursor-not-allowed text-[#000] py-4 rounded-xl font-bold text-[15px] transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          
          {!isSuccess && (
            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-sm text-text-secondary">
                Already have an account?{" "}
                <Link href="/signin" className="font-bold text-white hover:text-accent-green transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}