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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <span className="font-bold text-xl">T</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
            <span>Checking session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] text-slate-900 p-4">
      {/* Main Bress Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs relative">
        
        {/* Header Badge & Title */}
        <div className="text-center mb-6">
          <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg mx-auto mb-3 shadow-xs">
            T
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-[11px] font-semibold mb-3">
            <Sparkles className="w-3 h-3 text-slate-700" />
            <span>Creator Studio Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5">Welcome Back</h1>
          <p className="text-xs text-slate-500 font-normal">Sign in to manage your OTT platform, videos & revenue</p>
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleStandardLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="creator@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-10 rounded-xl text-xs"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
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
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-10 pr-10 rounded-xl text-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-950/10 cursor-pointer"
              />
              <span className="text-xs text-slate-600 font-medium">Remember me</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer text-xs"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign In to Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
            <KeyRound className="w-3 h-3 text-slate-400" />
            Creator Studio
          </span>
          <span className="text-slate-400 font-medium text-[11px]">
            Secure Connection
          </span>
        </div>
      </div>
    </div>
  );
}
