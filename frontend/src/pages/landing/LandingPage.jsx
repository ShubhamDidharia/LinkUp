import { Link } from 'react-router-dom';
import { Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img src="/LinkUp main Logo.png" alt="LinkUp Logo" className="w-10 h-10 object-contain transform group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">linkUp</span>
          </Link>

          {/* Sign In Button */}
          <Link to="/login">
            <Button
              variant="outline"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-300"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6 group cursor-pointer">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Introducing the future of social connection</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Say it.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Share it.
            </span>{' '}
            Connect.
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
            Join millions of people connecting, sharing ideas, and discovering what's trending right now. Real-time conversations at the speed of thought.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link to="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full border-2 border-slate-600 text-slate-200 hover:bg-slate-800 hover:border-blue-500 rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:-translate-y-1"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-col sm:flex-row gap-8 pt-8 border-t border-slate-700/50">
            <div>
              <div className="text-3xl font-bold text-blue-400">2M+</div>
              <p className="text-slate-400 mt-1">Active Users</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">50M+</div>
              <p className="text-slate-400 mt-1">Daily Posts</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">100+</div>
              <p className="text-slate-400 mt-1">Countries</p>
            </div>
          </div>
        </div>

        {/* Right Side - Floating Mockup */}
        <div className="flex-1 relative hidden lg:flex items-center justify-center">
          {/* Floating Phone Frame Animation */}
          <div className="relative w-72 h-96 animate-float">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-40"></div>

            {/* Phone Body */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-8 border-slate-700 shadow-2xl overflow-hidden">
              {/* Phone Screen */}
              <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 p-4 flex flex-col items-center justify-center gap-4">
                {/* Fake Posts */}
                <div className="w-full space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-700/50 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                        <div className="h-2 bg-slate-600 rounded w-24"></div>
                      </div>
                      <div className="h-2 bg-slate-600 rounded w-full"></div>
                      <div className="h-2 bg-slate-600 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl border-x-2 border-b-2 border-slate-700"></div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 -left-10 w-20 h-20 bg-blue-500/20 rounded-lg blur-xl animate-float animation-delay-1000"></div>
          <div className="absolute bottom-20 -right-10 w-20 h-20 bg-purple-500/20 rounded-lg blur-xl animate-float animation-delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Experience the next generation of social networking with powerful features
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 - Real-Time Feed */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 h-full hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Feed</h3>
              <p className="text-slate-400">
                See what's happening right now. Stay updated with instant notifications and live updates from people you follow.
              </p>
            </div>
          </div>

          {/* Feature 2 - Follow People */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 h-full hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Connect & Follow</h3>
              <p className="text-slate-400">
                Build your community by following people who inspire you. Create meaningful connections and engage with like-minded individuals.
              </p>
            </div>
          </div>

          {/* Feature 3 - Trending Topics */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 h-full hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trending Topics</h3>
              <p className="text-slate-400">
                Discover what the world is talking about. Find trending topics, hashtags, and conversations happening globally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Ready to Join the Community?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Start connecting, sharing, and discovering with millions of people worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:-translate-y-1">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:-translate-y-1"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 backdrop-blur-sm bg-slate-900/50 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4 group cursor-pointer">
                <img src="/LinkUp main Logo.png" alt="LinkUp Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  linkUp
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Connect, share, and discover with our modern social platform.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <Link to="/login" className="hover:text-blue-400 transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-blue-400 transition-colors">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-700/50 pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-sm">
            <p>&copy; 2026 linkUp. All rights reserved.</p>
            <p>Built with ❤️ for amazing connections</p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
