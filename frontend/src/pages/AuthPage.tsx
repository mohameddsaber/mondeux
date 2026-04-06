import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { apiFetch } from "../lib/api";
import { fetchCart } from "../utils/cartManager";

interface LoginFormProps {
  onToggle: () => void;
}

interface SignupFormProps {
  onToggle: () => void;
}

export default function AuthPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");

  const [isLogin, setIsLogin] = useState(mode !== "signup");

  useEffect(() => {
    setIsLogin(mode !== "signup");
  }, [mode]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onToggle={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggle={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}


// Login Component
function LoginForm({ onToggle }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiFetch('/users/login', {
        method: 'POST',
        json: formData,
      });

      const data = await response.json();

      if (data.success) {
        fetchCart().catch((cartError) => {
          console.error("Failed to load cart after login:", cartError);
        });

        window.location.assign(data.data.role === 'admin' ? '/admin/dashboard' : '/');

      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold font-[Karla] tracking-wider text-[#121212]">
          MONDEUX
        </h1>
        <p className="mt-4 text-sm font-[Karla] text-gray-600">
          Welcome back. Sign in to your account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Email Input */}
        <div>
          <label className="block text-xs font-[Karla] font-bold tracking-wider text-[#121212] mb-2">
            EMAIL
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors font-[Karla]"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-[Karla] font-bold tracking-wider text-[#121212] mb-2">
            PASSWORD
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors font-[Karla]"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            className="text-xs font-[Karla] text-gray-600 hover:text-black transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 font-[Karla] font-bold text-sm tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>

        {/* Toggle to Signup */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm font-[Karla] text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onToggle}
              className="font-bold text-black hover:opacity-70 transition-opacity"
            >
              Create one
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

// Signup Component
function SignupForm({ onToggle }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/users/register', {
        method: 'POST',
        json: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }
      });

      const data = await response.json();

      if (data.success) {
        window.location.assign('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold font-[Karla] tracking-wider text-[#121212]">
          MONDEUX
        </h1>
        <p className="mt-4 text-sm font-[Karla] text-gray-600">
          Create your account to get started.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Name Input */}
        <div>
          <label className="block text-xs font-[Karla] font-bold tracking-wider text-[#121212] mb-2">
            FULL NAME
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors font-[Karla]"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-xs font-[Karla] font-bold tracking-wider text-[#121212] mb-2">
            EMAIL
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors font-[Karla]"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-xs font-[Karla] font-bold tracking-wider text-[#121212] mb-2">
            PHONE (OPTIONAL)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors font-[Karla]"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-[Karla] font-bold tracking-wider text-[#121212] mb-2">
            PASSWORD
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors font-[Karla]"
              placeholder="Minimum 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-xs font-[Karla] font-bold tracking-wider text-[#121212] mb-2">
            CONFIRM PASSWORD
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors font-[Karla]"
              placeholder="Re-enter password"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 font-[Karla] font-bold text-sm tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </button>

        {/* Toggle to Login */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm font-[Karla] text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggle}
              className="font-bold text-black hover:opacity-70 transition-opacity"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
