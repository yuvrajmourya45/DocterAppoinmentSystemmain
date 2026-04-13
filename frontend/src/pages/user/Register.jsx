import React, { useState } from "react";
import API from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, UserPlus } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1) Create user
      const res = await axios.post("http://localhost:8000/api/auth/register", {
        name,
        email,
        password,
      });

      toast.success(res.data.message || "✅ Registration Successful!");

      // 2) Immediately login the user (frontend auto-login)
      try {
        const loginRes = await axios.post("http://localhost:8000/api/auth/login", {
          email,
          password,
        });

        if (loginRes.data.token) {
          localStorage.setItem("token", loginRes.data.token);
          localStorage.setItem("user", JSON.stringify(loginRes.data.user));

          window.dispatchEvent(
            new CustomEvent("authChange", {
              detail: { user: loginRes.data.user, token: loginRes.data.token },
            })
          );

          setTimeout(() => {
            navigate("/"); 
          }, 800);
        } else {
          setTimeout(() => {
            navigate("/");
          }, 800);
        }
      } catch (loginErr) {
        console.error("Auto-login failed:", loginErr);
        toast.info("Registration done. Please login.");
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "❌ Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/login")}
          className="mb-3 sm:mb-4 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Login</span>
        </button>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Join our healthcare community</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm mb-3">Already have an account?</p>
            <button
              onClick={() => navigate("/login")}
              className="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              Sign In
            </button>
          </div>

          {/* Terms */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our{" "}
              <span className="text-green-600 hover:underline cursor-pointer">Terms</span>
              {" "}and{" "}
              <span className="text-green-600 hover:underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Register;
