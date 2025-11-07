import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, Award, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BuildConnect</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium">How It Works</a>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Login</Link>
              <Button onClick={() => navigate('/signup')} className="btn-primary text-white px-6" data-testid="nav-signup-btn">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-blue-600 font-medium">Features</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-blue-600 font-medium">How It Works</a>
              <Link to="/login" className="block text-gray-700 hover:text-blue-600 font-medium">Login</Link>
              <Button onClick={() => navigate('/signup')} className="w-full btn-primary text-white" data-testid="mobile-signup-btn">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 hero-gradient">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Connect with Verified Contractors
            <br />
            <span className="text-blue-600">for Your Construction Projects</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            The digital marketplace where builders find trusted contractors and contractors discover new opportunities through transparent bidding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/signup?type=builder')} 
              className="btn-primary text-white px-8 py-6 text-lg"
              data-testid="hero-post-project-btn"
            >
              Post a Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate('/signup?type=contractor')} 
              className="btn-secondary text-white px-8 py-6 text-lg"
              data-testid="hero-find-work-btn"
            >
              Find Work
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-400 mb-2">1000+</div>
              <div className="text-xl text-gray-300">Verified Contractors</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-orange-400 mb-2">500+</div>
              <div className="text-xl text-gray-300">Projects Completed</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-400 mb-2">98%</div>
              <div className="text-xl text-gray-300">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Post Your Project</h3>
              <p className="text-gray-600 leading-relaxed">
                Builders create detailed project listings with requirements, budget, and timeline. Our platform makes it easy to specify exactly what you need.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Receive Bids</h3>
              <p className="text-gray-600 leading-relaxed">
                Verified contractors review your project and submit competitive bids with their proposals, pricing, and timeline estimates.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Award & Build</h3>
              <p className="text-gray-600 leading-relaxed">
                Compare bids, review contractor profiles and ratings, then award the project to your chosen contractor and start building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Choose BuildConnect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Verified Contractors', desc: 'All contractors are verified for credentials and past work quality' },
              { title: 'Transparent Bidding', desc: 'Clear, competitive pricing with detailed proposals from contractors' },
              { title: 'Save Time', desc: 'Find the right contractor in days, not weeks or months' },
              { title: 'Secure Platform', desc: 'Protected data and secure communication channels' },
              { title: 'Rating System', desc: 'Make informed decisions based on contractor ratings and reviews' },
              { title: 'Project Tracking', desc: 'Monitor your projects and bids from one central dashboard' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <CheckCircle className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-10 text-blue-100">
            Join thousands of builders and contractors already using BuildConnect to streamline their projects.
          </p>
          <Button 
            onClick={() => navigate('/signup')} 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
            data-testid="cta-signup-btn"
          >
            Create Free Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Building2 className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">BuildConnect</span>
            </div>
            <div className="text-center md:text-right">
              <p>&copy; 2025 BuildConnect. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;