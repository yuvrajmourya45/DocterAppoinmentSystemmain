import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, User, Stethoscope } from "lucide-react";
import API from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await API.post("/api/auth/login", {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        window.dispatchEvent(
          new CustomEvent("authChange", {
            detail: { user: response.data.user, token: response.data.token },
          })
        );

        toast.success("✅ Login Successful!", {
          position: "top-center",
        });

        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error("❌ Invalid response from server", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("❌ Invalid email or password", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-3 sm:mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
              <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">Welcome Back</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-2 sm:py-2.5 lg:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2 sm:py-2.5 lg:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-2.5 lg:py-3 rounded-xl font-semibold text-sm sm:text-base hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-gray-500 text-xs mb-2">Don't have an account?</p>
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
            >
              Create Account
            </button>
          </div>

          {/* Quick Access */}
          <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500 mb-2">Quick Access</p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/admin-login")}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 px-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs font-medium text-gray-700"
              >
                <Stethoscope className="w-3 h-3" />
                Admin
              </button>
              <button
                onClick={() => navigate("/doctor-login")}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 px-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs font-medium text-gray-700"
              >
                <User className="w-3 h-3" />
                Doctor
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
