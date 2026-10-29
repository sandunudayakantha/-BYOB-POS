import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FormInput } from "@/components/FormFields";
import toast from "react-hot-toast";
import { QrCodeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === "SUPER_ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const msg = err.message || "Login failed. Please check credentials.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4">
      <div className="w-full max-w-md bg-stone-900 rounded-3xl shadow-2xl border border-stone-800 p-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20 font-bold">
            <QrCodeIcon className="w-8 h-8 text-stone-950" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-100">
            SaaS QR Menu Portal
          </h2>
          <p className="text-sm text-stone-400">
            Enter your account credentials to access your portal
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Email Address"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LockClosedIcon className="w-4 h-4 text-stone-950" />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
