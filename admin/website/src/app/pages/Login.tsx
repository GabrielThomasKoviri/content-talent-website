import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, AlertCircle, KeyRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  // Passive API Integration Handler
  // API Specification from API_DOCUMENTATION.md:
  // POST api/v1/auth/login
  // Request body: { "email": string, "password": string }
  // Response 200: { "accessToken": string, "refreshToken": string, "expiresIn": number, "user": {...} }
  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthStatus(null);

    /* 
      PASSIVE API STUB (To be active when backend auth switch is enabled):
      
      try {
        const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok && data.accessToken) {
          localStorage.setItem("access_token", data.accessToken);
          localStorage.setItem("refresh_token", data.refreshToken);
          navigate("/");
        } else {
          setAuthStatus(data.message || "Invalid credentials");
        }
      } catch (err) {
        setAuthStatus("Failed to connect to authentication server.");
      }
    */

    setTimeout(() => {
      setLoading(false);
      setAuthStatus("Passive Mode Active: Login verification simulated. API integration ready in api/v1/auth/login.");
    }, 600);
  };

  // Passive Auth0 SSO Login Handler
  // As specified: Auth0 login in api_documentation.md
  const handleAuth0Login = () => {
    setLoading(true);
    /* 
      PASSIVE AUTH0 REDIRECT STUB:
      
      const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
      const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
      const redirectUri = window.location.origin + "/callback";
      window.location.href = `https://${auth0Domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid profile email`;
    */
    setTimeout(() => {
      setLoading(false);
      setAuthStatus("Auth0 SSO Passive State: Auth0 OAuth flow configured. Ready to trigger upon activation.");
    }, 600);
  };

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
            <span>Creator OTT Platform</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-slate-400">Sign in to manage your videos, playlists & analytics</p>
        </div>

        {/* Passive Status Notification Banner */}
        {authStatus && (
          <div className="mb-6 p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="flex-1">{authStatus}</div>
          </div>
        )}

        {/* Auth0 SSO Login Button */}
        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleAuth0Login}
            disabled={loading}
            className="w-full h-11 bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white flex items-center justify-center gap-2.5 transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Continue with Auth0 SSO</span>
          </Button>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase font-semibold">Or with email</span>
        </div>

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
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Password
              </Label>
              <button
                type="button"
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => setAuthStatus("Password reset link (POST api/v1/auth/forgot-password) passive.")}
              >
                Forgot password?
              </button>
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
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Passive Mode Helper Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-500">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            Passive Mode
          </span>
          <button
            onClick={() => navigate("/")}
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Enter Platform →
          </button>
        </div>
      </div>
    </div>
  );
}
