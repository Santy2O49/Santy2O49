import { useEffect, useState } from "react";
import "@/App.css";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Shield, 
  Home, 
  Map, 
  ChevronRight,
  Menu,
  X,
  Clock,
  Users,
  Award,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Company Info
const COMPANY = {
  name: "Skillconnect LLC",
  phone: "(479) 977-6813",
  email: "skillconnect.recruiting@gmail.com",
  quickApp: "https://intelliapp.driverapponline.com/m/skillconnect",
  tagline: "Connecting CDL Professionals Nationwide"
};

// Hero Background Image
const HERO_BG = "https://images.unsplash.com/photo-1633521248898-19cbbf9ead88?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzZW1pJTIwdHJ1Y2slMjBoaWdod2F5JTIwc3Vuc2V0fGVufDB8fHx8MTc3MTI2NTY1MXww&ixlib=rb-4.1.0&q=85";

// Partner companies (anonymous)
const PARTNERS = [
  "Premier Carrier", "National Fleet", "TransAmerica Logistics",
  "Cross Country Transport", "United Freight", "Alliance Trucking",
  "Continental Express", "Highway Masters", "Prime Routes",
  "Nationwide Haulers", "Elite Transport", "Freedom Freight"
];

// Header Component
const Header = ({ scrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header 
      data-testid="header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-effect shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3" data-testid="logo">
            <Truck className="w-8 h-8 text-blue-500" />
            <span className="font-['Oswald'] text-xl md:text-2xl font-bold uppercase tracking-wide text-white">
              {COMPANY.name}
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('benefits')} className="text-slate-300 hover:text-white transition-colors font-medium">
              Why Us
            </button>
            <button onClick={() => scrollToSection('jobs')} className="text-slate-300 hover:text-white transition-colors font-medium">
              Jobs
            </button>
            <button onClick={() => scrollToSection('apply')} className="text-slate-300 hover:text-white transition-colors font-medium">
              Apply
            </button>
            <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-medium">{COMPANY.phone}</span>
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a 
              href={COMPANY.quickApp}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="header-apply-btn"
            >
              <Button className="btn-accent">
                Quick Apply
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-effect rounded-lg mt-2 p-4" data-testid="mobile-menu">
            <nav className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('benefits')} className="text-slate-300 hover:text-white transition-colors text-left py-2">
                Why Us
              </button>
              <button onClick={() => scrollToSection('jobs')} className="text-slate-300 hover:text-white transition-colors text-left py-2">
                Jobs
              </button>
              <button onClick={() => scrollToSection('apply')} className="text-slate-300 hover:text-white transition-colors text-left py-2">
                Apply
              </button>
              <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-white py-2">
                <Phone className="w-4 h-4" />
                <span>{COMPANY.phone}</span>
              </a>
              <a 
                href={COMPANY.quickApp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent text-center py-3 rounded mt-2"
              >
                Quick Apply
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section 
      data-testid="hero-section"
      className="hero-section relative flex items-center"
      style={{ backgroundImage: `url(${HERO_BG})` }}
    >
      <div className="hero-overlay absolute inset-0" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-32 md:py-0">
        <div className="max-w-3xl">
          <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4 text-sm">
            30+ Carriers Nationwide
          </p>
          
          <h1 className="font-['Oswald'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-white leading-tight mb-6">
            Drive With The Best.<br />
            <span className="text-gradient">Earn What You Deserve.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl">
            Connecting CDL professionals with top-tier trucking companies nationwide. 
            High pay, better benefits, and routes that fit your life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href={COMPANY.quickApp}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-apply-btn"
            >
              <Button className="btn-primary w-full sm:w-auto text-lg py-6 px-8">
                Apply Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <Button 
              className="btn-secondary w-full sm:w-auto text-lg py-6 px-8"
              onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="hero-view-jobs-btn"
            >
              View Jobs
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap gap-8 text-slate-400">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>1000+ Drivers Placed</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span>Top-Rated Recruiter</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Partners Marquee Section
const PartnersSection = () => {
  return (
    <section data-testid="partners-section" className="bg-slate-950 py-8 border-y border-slate-800 overflow-hidden">
      <p className="text-center text-slate-500 uppercase tracking-widest text-sm mb-6 font-semibold">
        Trusted By Industry Leaders
      </p>
      <div className="relative">
        <div className="animate-marquee flex gap-12 whitespace-nowrap">
          {[...PARTNERS, ...PARTNERS].map((partner, index) => (
            <span 
              key={index} 
              className="text-slate-600 font-['Oswald'] text-xl uppercase tracking-wider"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

// Benefits Section
const BenefitsSection = () => {
  const benefits = [
    {
      icon: Map,
      title: "Nationwide Network",
      description: "Access to 30+ carriers across all 48 contiguous states. Find the perfect route for your lifestyle."
    },
    {
      icon: DollarSign,
      title: "Top Tier Pay",
      description: "Competitive CPM rates and guaranteed weekly minimums. Get paid what you're worth."
    },
    {
      icon: Shield,
      title: "Full Benefits",
      description: "Health, dental, vision, and 401k options available. Take care of yourself and your family."
    },
    {
      icon: Home,
      title: "Home Time",
      description: "Routes that respect your time with family. Regional, OTR, and dedicated options available."
    }
  ];

  return (
    <section id="benefits" data-testid="benefits-section" className="section-container bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4 text-sm">
            Why Choose Us
          </p>
          <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white">
            More Than Just A Recruiter
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="feature-card group cursor-default"
              data-testid={`benefit-card-${index}`}
            >
              <CardContent className="p-8">
                <benefit.icon className="w-12 h-12 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-['Oswald'] text-2xl font-bold text-white uppercase tracking-wide mb-4">
                  {benefit.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Jobs Section
const JobsSection = ({ jobs }) => {
  return (
    <section id="jobs" data-testid="jobs-section" className="section-container bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4 text-sm">
            Current Openings
          </p>
          <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white">
            Featured Opportunities
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <Card 
              key={job.id || index} 
              className="job-card"
              data-testid={`job-card-${index}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold bg-blue-500/10 px-3 py-1 rounded">
                    {job.job_type}
                  </span>
                </div>
                <CardTitle className="font-['Oswald'] text-xl font-bold text-white uppercase">
                  {job.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-green-400 font-semibold">{job.pay}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>
                <a 
                  href={COMPANY.quickApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                  data-testid={`job-apply-btn-${index}`}
                >
                  Apply for this position
                  <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-slate-400 mb-6">
            Don't see what you're looking for? We have more opportunities available.
          </p>
          <a 
            href={COMPANY.quickApp}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="jobs-apply-btn"
          >
            <Button className="btn-primary">
              See All Positions
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

// Application Form Section
const ApplicationSection = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    cdl_experience: '',
    zip_code: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        cdl_experience: parseInt(formData.cdl_experience) || 0
      };
      
      await axios.post(`${API}/leads`, payload);
      toast.success("Application Submitted!", {
        description: "We'll contact you within 24 hours."
      });
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        cdl_experience: '',
        zip_code: ''
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Submission Failed", {
        description: "Please try again or call us directly."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="apply" data-testid="apply-section" className="section-container bg-slate-950 relative">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4 text-sm">
            Get Started Today
          </p>
          <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white mb-4">
            Start Your Journey
          </h2>
          <p className="text-slate-400 text-lg">
            Fill out the form below or call us directly at{' '}
            <a href={`tel:${COMPANY.phone}`} className="text-blue-400 hover:text-blue-300 font-semibold">
              {COMPANY.phone}
            </a>
          </p>
        </div>
        
        <Card className="glass-effect border-slate-700" data-testid="application-form-card">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="application-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="John Smith"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="form-input h-12"
                    required
                    data-testid="input-full-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input h-12"
                    required
                    data-testid="input-phone"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input h-12"
                  required
                  data-testid="input-email"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                    CDL Experience (Years) *
                  </label>
                  <Select 
                    value={formData.cdl_experience} 
                    onValueChange={(value) => setFormData({ ...formData, cdl_experience: value })}
                  >
                    <SelectTrigger className="form-input h-12" data-testid="select-experience">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="0">Less than 1 year</SelectItem>
                      <SelectItem value="1">1-2 years</SelectItem>
                      <SelectItem value="3">3-5 years</SelectItem>
                      <SelectItem value="5">5-10 years</SelectItem>
                      <SelectItem value="10">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                    Zip Code *
                  </label>
                  <Input
                    type="text"
                    placeholder="12345"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="form-input h-12"
                    required
                    maxLength={5}
                    data-testid="input-zip"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="btn-accent w-full py-6 text-lg"
                  disabled={isSubmitting}
                  data-testid="submit-application-btn"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
              
              <p className="text-center text-slate-500 text-sm">
                By submitting, you agree to be contacted about driving opportunities.
              </p>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-slate-400 mb-4">Prefer the full application?</p>
          <a 
            href={COMPANY.quickApp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            data-testid="intelliapp-link"
          >
            Complete IntelliApp Application
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
};

// Footer Section
const Footer = () => {
  return (
    <footer data-testid="footer" className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="w-8 h-8 text-blue-500" />
              <span className="font-['Oswald'] text-2xl font-bold uppercase tracking-wide text-white">
                {COMPANY.name}
              </span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              {COMPANY.tagline}. We connect professional CDL drivers with the best trucking companies across the nation.
            </p>
            <div className="flex gap-4">
              <a 
                href={COMPANY.quickApp}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-apply-btn"
              >
                <Button className="btn-primary">
                  Apply Now
                </Button>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-['Oswald'] text-lg font-bold uppercase tracking-wide text-white mb-6">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-3">
              <button 
                onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-400 hover:text-white transition-colors text-left"
              >
                Why Choose Us
              </button>
              <button 
                onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-400 hover:text-white transition-colors text-left"
              >
                Job Listings
              </button>
              <button 
                onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-400 hover:text-white transition-colors text-left"
              >
                Apply Now
              </button>
              <a 
                href={COMPANY.quickApp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                IntelliApp
                <ExternalLink className="w-3 h-3" />
              </a>
            </nav>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-['Oswald'] text-lg font-bold uppercase tracking-wide text-white mb-6">
              Contact Us
            </h4>
            <div className="space-y-4">
              <a 
                href={`tel:${COMPANY.phone}`} 
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                data-testid="footer-phone"
              >
                <Phone className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">{COMPANY.phone}</span>
              </a>
              <a 
                href={`mailto:${COMPANY.email}`} 
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                data-testid="footer-email"
              >
                <Mail className="w-5 h-5 text-blue-500" />
                <span>{COMPANY.email}</span>
              </a>
              <div className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                <span>Recruiting Nationwide<br />All 48 Contiguous States</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-slate-500 text-sm">
            <span>Professional CDL Recruiting</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  const [scrolled, setScrolled] = useState(false);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // First seed the jobs
        await axios.post(`${API}/jobs/seed`);
        // Then fetch them
        const response = await axios.get(`${API}/jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Fallback jobs if API fails
        setJobs([
          {
            id: '1',
            title: 'OTR Dry Van Driver',
            location: 'Nationwide',
            pay: '$0.65 - $0.75 CPM',
            job_type: 'Full Time',
            description: 'Join our fleet of professional OTR drivers covering routes across the continental United States.'
          },
          {
            id: '2',
            title: 'Regional Flatbed Driver',
            location: 'Midwest / Southeast',
            pay: '$1,500 - $1,800 / week',
            job_type: 'Full Time',
            description: 'Regional flatbed positions with consistent home time. Haul construction materials and equipment.'
          },
          {
            id: '3',
            title: 'Dedicated Lane - TX to CA',
            location: 'Texas to California',
            pay: '$1,600 Guaranteed Weekly',
            job_type: 'Contract',
            description: 'Dedicated lane running from Texas to California. Consistent freight, predictable schedule.'
          }
        ]);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="App min-h-screen bg-slate-950" data-testid="app-container">
      <Toaster position="top-right" richColors />
      <Header scrolled={scrolled} />
      <main>
        <HeroSection />
        <PartnersSection />
        <BenefitsSection />
        <JobsSection jobs={jobs} />
        <ApplicationSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
