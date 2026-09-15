import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, KeyRound, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { adminLogin, adminGetMe, getStoredToken, clearStoredAuth } from "../services/apiService";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(() => !!getStoredToken());

  useEffect(() => {
    let isMounted = true;
    const token = getStoredToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }

    adminGetMe()
      .then(() => {
        if (isMounted) {
          navigate("/", { replace: true });
        }
      })
      .catch(() => {
        if (isMounted) {
          clearStoredAuth();
          setCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await adminLogin({ email: email.trim(), password });
      const from = (location.state as any)?.from || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="font-bold text-white text-xl">T</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            <span>Checking session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden p-4">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl z-10 relative">
        
        {/* Header Badge & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creator Studio Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-slate-400">Sign in to manage your OTT platform, videos & revenue</p>
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleStandardLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="creator@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 h-11 focus:ring-purple-500/40 focus:border-purple-500"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 h-11 pr-10 focus:ring-purple-500/40 focus:border-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-purple-500/30"
              />
              <span className="text-xs text-slate-400">Remember me</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign In to Studio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-500">
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            Creator Studio
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            FastAPI Auth Protected
          </span>
        </div>
      </div>
    </div>
  );
}
