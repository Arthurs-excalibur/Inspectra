"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import { inspectraApi } from "@/services/inspectra-api";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, Lock, User } from "lucide-react";

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { user, token } = await inspectraApi.auth.login({ email, password });
        setAuth(user, token);
      } else {
        const { user, token } = await inspectraApi.auth.register({ email, password, name });
        setAuth(user, token);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#061017]">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111823]/50 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-xl bg-gradient-to-br from-cyan to-green font-black text-[#061017] shadow-[0_0_36px_rgba(90,215,255,0.4)] text-2xl">
            I
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mt-2 text-muted text-sm">
            {isLogin ? "Enter your credentials to access Inspectra" : "Join the autonomous QA revolution"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm focus:border-cyan/50 focus:outline-none transition-colors"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm focus:border-cyan/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm focus:border-cyan/50 focus:outline-none transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan to-green font-bold text-[#061017] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="size-5 border-2 border-[#061017]/30 border-t-[#061017] rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="size-4" />
                {isLogin ? "Launch Inspectra" : "Start Free Trial"}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-muted hover:text-cyan transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
