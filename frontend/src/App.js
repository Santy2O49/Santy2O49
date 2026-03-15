import { useEffect, useState, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
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
  ExternalLink,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  Briefcase,
  UserPlus,
  Trash2,
  Edit,
  LogOut,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  Download,
  TrendingUp,
  MousePointerClick,
  Target,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter } from
"@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
"@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default Config (fallback)
const DEFAULT_CONFIG = {
  site_name: "CDL Driver Career Hub",
  powered_by_name: "Skillconnect LLC",
  phone: "(479) 977-6813",
  email: "skillconnect.recruiting@gmail.com",
  quick_app_url: "https://intelliapp.driverapponline.com/m/skillconnect",
  application_limit: 100,
  applications_used: 0
};

// Hero Background Image
const HERO_BG = "https://images.unsplash.com/photo-1633521248898-19cbbf9ead88?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzZW1pJTIwdHJ1Y2slMjBoaWdod2F5JTIwc3Vuc2V0fGVufDB8fHx8MTc3MTI2NTY1MXww&ixlib=rb-4.1.0&q=85";

// Partner companies (anonymous)
const PARTNERS = [
"Premier Carrier", "National Fleet", "TransAmerica Logistics",
"Cross Country Transport", "United Freight", "Alliance Trucking",
"Continental Express", "Highway Masters", "Prime Routes",
"Nationwide Haulers", "Elite Transport", "Freedom Freight"];


// ============== SEO COMPONENT ==============
const SEOHead = ({ title, description, path = "/" }) => {
  useEffect(() => {
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', window.location.origin + path);
    }

    // Update OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', window.location.origin + path);
  }, [title, description, path]);

  return null;
};

// ============== SHARED COMPONENTS ==============

// Header Component
const Header = ({ scrolled, config, isHomePage = true }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (isHomePage) {
      // On home page, scroll to section
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // On other pages, navigate to home with hash
      navigate('/#' + sectionId);
    }
  };

  return (
    <header
      data-testid="header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-effect shadow-lg' : 'bg-transparent'}`
      }>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo" aria-label="Go to homepage">
            <Truck className="w-8 h-8 text-blue-500" aria-hidden="true" />
            <span className="font-['Oswald'] text-xl md:text-2xl font-bold uppercase tracking-wide text-white">
              {config.site_name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <Link to="/#benefits" onClick={() => handleNavClick('benefits')} className="text-slate-300 hover:text-white transition-colors font-medium">
              Why Us
            </Link>
            <Link to="/#jobs" onClick={() => handleNavClick('jobs')} className="text-slate-300 hover:text-white transition-colors font-medium">
              Jobs
            </Link>
            <Link to="/#apply" onClick={() => handleNavClick('apply')} className="text-slate-300 hover:text-white transition-colors font-medium">
              Apply
            </Link>
            <Link to="/request-info" className="text-slate-300 hover:text-white transition-colors font-medium">
              Request Info
            </Link>
            <a href={`tel:${config.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors" aria-label={`Call us at ${config.phone}`}>
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span className="font-medium">{config.phone}</span>
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a
              href={config.quick_app_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="header-apply-btn"
              aria-label="Quick Apply for CDL Jobs">

              <Button className="btn-accent">
                Quick Apply
                <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}>

            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen &&
        <div className="md:hidden glass-effect rounded-lg mt-2 p-4" data-testid="mobile-menu" role="navigation" aria-label="Mobile navigation">
            <nav className="flex flex-col gap-4">
              <Link to="/#benefits" onClick={() => handleNavClick('benefits')} className="text-slate-300 hover:text-white transition-colors text-left py-2">
                Why Us
              </Link>
              <Link to="/#jobs" onClick={() => handleNavClick('jobs')} className="text-slate-300 hover:text-white transition-colors text-left py-2">
                Jobs
              </Link>
              <Link to="/#apply" onClick={() => handleNavClick('apply')} className="text-slate-300 hover:text-white transition-colors text-left py-2">
                Apply
              </Link>
              <Link to="/request-info" className="text-slate-300 hover:text-white transition-colors text-left py-2" onClick={() => setMobileMenuOpen(false)}>
                Request Info
              </Link>
              <a href={`tel:${config.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-white py-2" aria-label={`Call ${config.phone}`}>
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>{config.phone}</span>
              </a>
              <a
              href={config.quick_app_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent text-center py-3 rounded mt-2"
              aria-label="Quick Apply for CDL Jobs">

                Quick Apply
              </a>
            </nav>
          </div>
        }
      </div>
    </header>);

};

// Footer Component
const Footer = ({ config }) => {
  return (
    <footer data-testid="footer" className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="w-8 h-8 text-blue-500" />
              <span className="font-['Oswald'] text-2xl font-bold uppercase tracking-wide text-white">
                {config.site_name}
              </span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              Connecting CDL Professionals Nationwide. We connect professional CDL drivers with the best trucking companies across the nation.
            </p>
            <div className="flex gap-4">
              <a
                href={config.quick_app_url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-apply-btn">

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
                className="text-slate-400 hover:text-white transition-colors text-left">

                Why Choose Us
              </button>
              <button
                onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-400 hover:text-white transition-colors text-left">

                Job Listings
              </button>
              <button
                onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-400 hover:text-white transition-colors text-left">

                Apply Now
              </button>
              <Link to="/request-info" className="text-slate-400 hover:text-white transition-colors">
                Request Info
              </Link>
              <a
                href={config.quick_app_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">

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
                href={`tel:${config.phone}`}
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                data-testid="footer-phone">

                <Phone className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">{config.phone}</span>
              </a>
              <a
                href={`mailto:${config.email}`}
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                data-testid="footer-email">

                <Mail className="w-5 h-5 text-blue-500" />
                <span>{config.email}</span>
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
            © {new Date().getFullYear()} {config.site_name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-slate-500 text-sm">
            <Link to="/admin" className="flex items-center gap-1 hover:text-slate-300 transition-colors">
              <Lock className="w-3 h-3" />
              Admin
            </Link>
            <span>Powered by <strong className="text-slate-400">{config.powered_by_name}</strong></span>
          </div>
        </div>
      </div>
    </footer>);

};

// ============== HOME PAGE COMPONENTS ==============

// Hero Section
const HeroSection = ({ config }) => {
  const applicationsRemaining = config.application_limit - config.applications_used;

  return (
    <section
      data-testid="hero-section"
      className="hero-section relative flex items-center"
      style={{ backgroundImage: `url(${HERO_BG})` }}
      aria-label="Welcome to CDL Career Hub">

      <div className="hero-overlay absolute inset-0" aria-hidden="true" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-32 md:py-0">
        <article className="max-w-3xl">
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
              href={config.quick_app_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-apply-btn"
              aria-label="Apply Now for CDL Truck Driving Jobs">

              <Button className="btn-primary w-full sm:w-auto text-lg py-6 px-8">
                Apply Now
                <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Button>
            </a>
            <Button
              className="btn-secondary w-full sm:w-auto text-lg py-6 px-8"
              onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="hero-view-jobs-btn"
              aria-label="View Available CDL Jobs">

              View Jobs
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap gap-8 text-slate-400" role="list" aria-label="Company statistics">
            <div className="flex items-center gap-2" role="listitem">
              <Users className="w-5 h-5 text-blue-500" aria-hidden="true" />
              <span>1000+ Drivers Placed</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <Award className="w-5 h-5 text-blue-500" aria-hidden="true" />
              <span>Top-Rated Recruiter</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <FileText className="w-5 h-5 text-green-500" aria-hidden="true" />
              <span className="text-green-400">{applicationsRemaining} Spots Available</span>
            </div>
          </div>
        </article>
      </div>
    </section>);

};

// Partners Marquee Section
const PartnersSection = () => {
  return (
    <section data-testid="partners-section" className="bg-slate-950 py-8 border-y border-slate-800 overflow-hidden">
      <p className="text-center text-slate-500 uppercase tracking-widest text-sm mb-6 font-semibold">Industry Leaders

      </p>
      <div className="relative">
        <div className="animate-marquee flex gap-12 whitespace-nowrap">
          {[...PARTNERS, ...PARTNERS].map((partner, index) =>
          <span
            key={index}
            className="text-slate-600 font-['Oswald'] text-xl uppercase tracking-wider">

              {partner}
            </span>
          )}
        </div>
      </div>
    </section>);

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
  }];


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
          {benefits.map((benefit, index) =>
          <Card
            key={index}
            className="feature-card group cursor-default"
            data-testid={`benefit-card-${index}`}>

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
          )}
        </div>
      </div>
    </section>);

};

// Jobs Section
const JobsSection = ({ jobs, config }) => {
  return (
    <section id="jobs" data-testid="jobs-section" className="section-container bg-slate-900/50" aria-labelledby="jobs-heading">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4 text-sm">
            Current Openings
          </p>
          <h2 id="jobs-heading" className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white">
            Featured CDL Truck Driving Opportunities
          </h2>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Job listings">
          {jobs.map((job, index) =>
          <article
            key={job.id || index}
            className="job-card"
            data-testid={`job-card-${index}`}
            role="listitem"
            itemScope
            itemType="https://schema.org/JobPosting">

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold bg-blue-500/10 px-3 py-1 rounded" itemProp="employmentType">
                      {job.job_type}
                    </span>
                  </div>
                  <CardTitle className="font-['Oswald'] text-xl font-bold text-white uppercase" itemProp="title">
                    {job.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-slate-400" itemProp="jobLocation" itemScope itemType="https://schema.org/Place">
                      <MapPin className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <span className="text-sm" itemProp="address">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2" itemProp="baseSalary" itemScope itemType="https://schema.org/MonetaryAmount">
                      <DollarSign className="w-4 h-4 text-green-500" aria-hidden="true" />
                      <span className="text-green-400 font-semibold" itemProp="value">{job.pay}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2" itemProp="description">
                    {job.description}
                  </p>
                  <a
                  href={config.quick_app_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                  data-testid={`job-apply-btn-${index}`}
                  aria-label={`Apply for ${job.title} position`}>

                    Apply for this position
                    <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                  </a>
                </CardContent>
              </Card>
            </article>
          )}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-slate-400 mb-6">
            Don't see what you're looking for? We have more opportunities available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={config.quick_app_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="jobs-apply-btn"
              aria-label="See All CDL Job Positions">

              <Button className="btn-primary">
                See All Positions
                <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </a>
            <Link to="/request-info" aria-label="Request more information about CDL jobs">
              <Button className="btn-secondary">
                Keep Me Posted
                <MessageSquare className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>);

};

// Application Form Section
const ApplicationSection = ({ config }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    cdl_experience: '',
    zip_code: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const applicationsRemaining = config.application_limit - config.applications_used;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (applicationsRemaining <= 0) {
      toast.error("Application limit reached", {
        description: "Please call us directly or check back later."
      });
      return;
    }

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
      if (error.response?.status === 400) {
        toast.error("Application limit reached", {
          description: "Please contact us directly."
        });
      } else {
        toast.error("Submission Failed", {
          description: "Please try again or call us directly."
        });
      }
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
            <a href={`tel:${config.phone}`} className="text-blue-400 hover:text-blue-300 font-semibold">
              {config.phone}
            </a>
          </p>
          {applicationsRemaining > 0 && applicationsRemaining <= 20 &&
          <p className="text-amber-400 mt-4 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Only {applicationsRemaining} spots remaining!
            </p>
          }
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
                    data-testid="input-full-name" />

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
                    data-testid="input-phone" />

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
                  data-testid="input-email" />

              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                    CDL Experience (Years) *
                  </label>
                  <Select
                    value={formData.cdl_experience}
                    onValueChange={(value) => setFormData({ ...formData, cdl_experience: value })}>

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
                    data-testid="input-zip" />

                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="btn-accent w-full py-6 text-lg"
                  disabled={isSubmitting || applicationsRemaining <= 0}
                  data-testid="submit-application-btn">

                  {isSubmitting ? 'Submitting...' : applicationsRemaining <= 0 ? 'Limit Reached - Call Us' : 'Submit Application'}
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
            href={config.quick_app_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            data-testid="intelliapp-link">

            Complete IntelliApp Application
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </section>);

};

// ============== REQUEST INFO PAGE ==============
const RequestInfoPage = ({ config }) => {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    preferred_contact: 'phone',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API}/info-requests`, formData);
      toast.success("Request Sent! 🚚", {
        description: "We'll holler at you soon, driver!"
      });
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        preferred_contact: 'phone',
        message: ''
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Couldn't send your request", {
        description: "Give us a ring directly instead!"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <SEOHead
        title={`Request Info | ${config.site_name} | CDL Driver Recruitment`}
        description="Can't find the perfect CDL job? Let us know what you're looking for. We'll keep your info on file and contact you when the right opportunity comes along."
        path="/request-info" />

      <Header scrolled={scrolled} config={config} isHomePage={false} />
      
      <main className="pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4 text-sm">
              Keep in Touch
            </p>
            <h1 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white mb-6">
              Don't See Your Perfect Haul?
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              No sweat, driver! Drop us your info and we'll keep our ears on for the right load. 
              Whether you're looking for something specific or just want us to keep you on the radar, 
              we got your back!
            </p>
          </div>

          <Card className="glass-effect border-slate-700" data-testid="info-request-card">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="info-request-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                      Your Handle (Name) *
                    </label>
                    <Input
                      type="text"
                      placeholder="Big Mike"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="form-input h-12"
                      required
                      data-testid="info-input-name" />

                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                      Phone (CB Number) *
                    </label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input h-12"
                      required
                      data-testid="info-input-phone" />

                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                    Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="trucker@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input h-12"
                    required
                    data-testid="info-input-email" />

                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                    Best Way to Reach Ya
                  </label>
                  <Select
                    value={formData.preferred_contact}
                    onValueChange={(value) => setFormData({ ...formData, preferred_contact: value })}>

                    <SelectTrigger className="form-input h-12" data-testid="info-select-contact">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="phone">Give Me a Ring 📞</SelectItem>
                      <SelectItem value="email">Shoot Me an Email 📧</SelectItem>
                      <SelectItem value="either">Either Works 👍</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                    What Are You Looking For? (Optional)
                  </label>
                  <Textarea
                    placeholder="Tell us what kind of runs you're after... Regional? OTR? Dedicated lanes? Home time needs? We're all ears, driver!"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input min-h-[120px] resize-none"
                    data-testid="info-textarea-message" />

                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="btn-accent w-full py-6 text-lg"
                    disabled={isSubmitting}
                    data-testid="info-submit-btn">

                    {isSubmitting ? 'Sending...' : "Keep Me in the Loop 🚛"}
                  </Button>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-slate-500 text-sm">
                    We'll keep your info on file and reach out when something matches your style.
                  </p>
                  <p className="text-slate-400">
                    Or give us a holler anytime at{' '}
                    <a href={`tel:${config.phone}`} className="text-blue-400 hover:text-blue-300 font-semibold">
                      {config.phone}
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer config={config} />
    </div>);

};

// ============== ADMIN PAGE ==============
const AdminPage = ({ config, refreshConfig }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data states
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [infoRequests, setInfoRequests] = useState([]);
  const [siteConfig, setSiteConfig] = useState(config);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Job form state
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    location: '',
    pay: '',
    job_type: 'Full Time',
    description: '',
    requirements: '',
    benefits: '',
    is_active: true
  });
  const [showJobDialog, setShowJobDialog] = useState(false);

  const getAuthHeader = useCallback(() => {
    return {
      auth: {
        username: credentials.username,
        password: credentials.password
      }
    };
  }, [credentials]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      await axios.post(`${API}/admin/login`, {}, {
        auth: {
          username: credentials.username,
          password: credentials.password
        }
      });
      setIsAuthenticated(true);
      toast.success("Welcome back, boss!");
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);

    try {
      const [statsRes, jobsRes, leadsRes, requestsRes, configRes] = await Promise.all([
      axios.get(`${API}/admin/stats`, getAuthHeader()),
      axios.get(`${API}/admin/jobs`, getAuthHeader()),
      axios.get(`${API}/admin/leads`, getAuthHeader()),
      axios.get(`${API}/admin/info-requests`, getAuthHeader()),
      axios.get(`${API}/config`)]
      );

      setStats(statsRes.data);
      setJobs(jobsRes.data);
      setLeads(leadsRes.data);
      setInfoRequests(requestsRes.data);
      setSiteConfig(configRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAuthHeader]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      await axios.put(`${API}/admin/config`, siteConfig, getAuthHeader());
      toast.success("Settings saved!");
      refreshConfig();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleResetCounter = async () => {
    try {
      await axios.post(`${API}/admin/config/reset-counter`, {}, getAuthHeader());
      toast.success("Application counter reset!");
      fetchData();
      refreshConfig();
    } catch (error) {
      toast.error("Failed to reset counter");
    }
  };

  const handleSaveJob = async () => {
    try {
      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.split('\n').filter((r) => r.trim()),
        benefits: jobForm.benefits.split('\n').filter((b) => b.trim())
      };

      if (editingJob) {
        await axios.put(`${API}/admin/jobs/${editingJob.id}`, jobData, getAuthHeader());
        toast.success("Job updated!");
      } else {
        await axios.post(`${API}/admin/jobs`, jobData, getAuthHeader());
        toast.success("Job created!");
      }

      setShowJobDialog(false);
      setEditingJob(null);
      setJobForm({
        title: '',
        location: '',
        pay: '',
        job_type: 'Full Time',
        description: '',
        requirements: '',
        benefits: '',
        is_active: true
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to save job");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await axios.delete(`${API}/admin/jobs/${jobId}`, getAuthHeader());
      toast.success("Job deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const handleToggleJobStatus = async (job) => {
    try {
      await axios.put(`${API}/admin/jobs/${job.id}`, { is_active: !job.is_active }, getAuthHeader());
      toast.success(`Job ${job.is_active ? 'deactivated' : 'activated'}!`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update job");
    }
  };

  const openEditJob = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      location: job.location,
      pay: job.pay,
      job_type: job.job_type,
      description: job.description,
      requirements: job.requirements?.join('\n') || '',
      benefits: job.benefits?.join('\n') || '',
      is_active: job.is_active
    });
    setShowJobDialog(true);
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm("Delete this lead?")) return;
    try {
      await axios.delete(`${API}/admin/leads/${leadId}`, getAuthHeader());
      toast.success("Lead deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const handleDownloadCSV = async (type) => {
    try {
      const response = await axios.get(`${API}/admin/${type}/download`, {
        ...getAuthHeader(),
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type === 'leads' ? 'Leads' : 'Info Requests'} downloaded!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download CSV");
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <Card className="w-full max-w-md glass-effect border-slate-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Truck className="w-12 h-12 text-blue-500" />
            </div>
            <CardTitle className="font-['Oswald'] text-2xl text-white uppercase">Admin Login</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Username</label>
                <Input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="form-input"
                  required
                  data-testid="admin-username" />

              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Password</label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="form-input"
                  required
                  data-testid="admin-password" />

              </div>
              <Button
                type="submit"
                className="btn-primary w-full"
                disabled={isLoggingIn}
                data-testid="admin-login-btn">

                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/" className="text-slate-400 hover:text-white text-sm">
                ← Back to Site
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>);

  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Admin Header */}
      <header className="glass-effect border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-blue-500" />
              <span className="font-['Oswald'] text-lg font-bold uppercase text-white">
                {siteConfig.site_name} Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
                <Eye className="w-4 h-4" />
                View Site
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAuthenticated(false);
                  setCredentials({ username: '', password: '' });
                }}
                className="text-slate-400 hover:text-white">

                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-900 border border-slate-800 mb-8">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600">
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-blue-600">
              <UserPlus className="w-4 h-4 mr-2" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-blue-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Info Requests
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Applications</p>
                      <p className="text-3xl font-bold text-white">
                        {stats?.applications_used || 0} / {stats?.application_limit || 100}
                      </p>
                      <p className="text-green-400 text-sm mt-1">
                        {stats?.applications_remaining || 0} remaining
                      </p>
                    </div>
                    <FileText className="w-10 h-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Leads</p>
                      <p className="text-3xl font-bold text-white">{stats?.total_leads || 0}</p>
                      <p className="text-amber-400 text-sm mt-1">
                        {stats?.new_leads || 0} new
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Job Views</p>
                      <p className="text-3xl font-bold text-white">{stats?.total_job_views || 0}</p>
                      <p className="text-blue-400 text-sm mt-1">
                        across all jobs
                      </p>
                    </div>
                    <Eye className="w-10 h-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Job Applications</p>
                      <p className="text-3xl font-bold text-white">{stats?.total_job_applications || 0}</p>
                      <p className="text-green-400 text-sm mt-1">
                        from job listings
                      </p>
                    </div>
                    <Target className="w-10 h-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second Row - More Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Info Requests</p>
                      <p className="text-3xl font-bold text-white">{stats?.info_requests || 0}</p>
                      <p className="text-amber-400 text-sm mt-1">
                        {stats?.pending_requests || 0} pending
                      </p>
                    </div>
                    <MessageSquare className="w-10 h-10 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Active Jobs</p>
                      <p className="text-3xl font-bold text-white">{stats?.active_jobs || 0}</p>
                      <p className="text-slate-500 text-sm mt-1">
                        {stats?.total_jobs || 0} total
                      </p>
                    </div>
                    <Briefcase className="w-10 h-10 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Conversion Rate</p>
                      <p className="text-3xl font-bold text-white">
                        {stats?.total_job_views > 0 
                          ? ((stats?.total_job_applications / stats?.total_job_views) * 100).toFixed(1)
                          : 0}%
                      </p>
                      <p className="text-blue-400 text-sm mt-1">
                        views to applications
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-cyan-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Performance Table */}
            <Card className="bg-slate-900 border-slate-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white font-['Oswald'] uppercase flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Job Performance Analytics
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Track views and applications for each job listing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400">Job Title</TableHead>
                      <TableHead className="text-slate-400 text-center">Views</TableHead>
                      <TableHead className="text-slate-400 text-center">Applications</TableHead>
                      <TableHead className="text-slate-400 text-center">Conversion</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => {
                      const views = job.views || 0;
                      const apps = job.applications || 0;
                      const conversion = views > 0 ? ((apps / views) * 100).toFixed(1) : 0;
                      return (
                        <TableRow key={job.id} className="border-slate-800">
                          <TableCell className="text-white font-medium">{job.title}</TableCell>
                          <TableCell className="text-center">
                            <span className="flex items-center justify-center gap-1 text-blue-400">
                              <Eye className="w-4 h-4" />
                              {views}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="flex items-center justify-center gap-1 text-green-400">
                              <MousePointerClick className="w-4 h-4" />
                              {apps}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-2">
                              <Progress value={Number(conversion)} className="w-16 h-2" />
                              <span className="text-slate-300 text-sm">{conversion}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={job.is_active ? "bg-green-600" : "bg-slate-600"}>
                              {job.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Actions Row */}
            <div className="flex flex-wrap gap-4">
              <Button onClick={fetchData} disabled={isLoading} className="btn-secondary">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button onClick={handleResetCounter} className="btn-secondary text-amber-400 border-amber-500/50 hover:border-amber-500">
                Reset Application Counter
              </Button>
              <Button 
                onClick={() => handleDownloadCSV('leads')} 
                className="btn-secondary text-green-400 border-green-500/50 hover:border-green-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Leads CSV
              </Button>
              <Button 
                onClick={() => handleDownloadCSV('info-requests')} 
                className="btn-secondary text-cyan-400 border-cyan-500/50 hover:border-cyan-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Info Requests CSV
              </Button>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-['Oswald'] text-2xl text-white uppercase">Manage Jobs</h2>
              <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
                <DialogTrigger asChild>
                  <Button className="btn-primary" onClick={() => {
                    setEditingJob(null);
                    setJobForm({
                      title: '',
                      location: '',
                      pay: '',
                      job_type: 'Full Time',
                      description: '',
                      requirements: '',
                      benefits: '',
                      is_active: true
                    });
                  }}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white font-['Oswald'] text-xl uppercase">
                      {editingJob ? 'Edit Job' : 'Add New Job'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Job Title *</Label>
                        <Input
                          value={jobForm.title}
                          onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                          className="form-input"
                          placeholder="OTR Dry Van Driver" />

                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Location *</Label>
                        <Input
                          value={jobForm.location}
                          onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                          className="form-input"
                          placeholder="Nationwide" />

                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Pay *</Label>
                        <Input
                          value={jobForm.pay}
                          onChange={(e) => setJobForm({ ...jobForm, pay: e.target.value })}
                          className="form-input"
                          placeholder="$0.65 - $0.75 CPM" />

                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Job Type</Label>
                        <Select
                          value={jobForm.job_type}
                          onValueChange={(value) => setJobForm({ ...jobForm, job_type: value })}>

                          <SelectTrigger className="form-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700">
                            <SelectItem value="Full Time">Full Time</SelectItem>
                            <SelectItem value="Part Time">Part Time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Description *</Label>
                      <Textarea
                        value={jobForm.description}
                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                        className="form-input min-h-[80px]"
                        placeholder="Job description..." />

                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Requirements (one per line)</Label>
                      <Textarea
                        value={jobForm.requirements}
                        onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                        className="form-input min-h-[80px]"
                        placeholder="Valid CDL-A&#10;2+ years experience&#10;Clean MVR" />

                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Benefits (one per line)</Label>
                      <Textarea
                        value={jobForm.benefits}
                        onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                        className="form-input min-h-[80px]"
                        placeholder="Health Insurance&#10;401k Match&#10;Weekly Pay" />

                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={jobForm.is_active}
                        onCheckedChange={(checked) => setJobForm({ ...jobForm, is_active: checked })} />

                      <Label className="text-slate-300">Active (visible on site)</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowJobDialog(false)}>Cancel</Button>
                    <Button className="btn-primary" onClick={handleSaveJob}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingJob ? 'Update Job' : 'Create Job'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-slate-900 border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Title</TableHead>
                    <TableHead className="text-slate-400">Location</TableHead>
                    <TableHead className="text-slate-400">Pay</TableHead>
                    <TableHead className="text-slate-400 text-center">Views</TableHead>
                    <TableHead className="text-slate-400 text-center">Apps</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) =>
                  <TableRow key={job.id} className="border-slate-800">
                      <TableCell className="text-white font-medium">{job.title}</TableCell>
                      <TableCell className="text-slate-400">{job.location}</TableCell>
                      <TableCell className="text-green-400">{job.pay}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-blue-400 flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3" />
                          {job.views || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-400 flex items-center justify-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          {job.applications || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={job.is_active ? "default" : "secondary"} className={job.is_active ? "bg-green-600" : "bg-slate-600"}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleJobStatus(job)}
                          className="text-slate-400 hover:text-white">

                            {job.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditJob(job)}
                          className="text-slate-400 hover:text-white">

                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-red-400 hover:text-red-300">

                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <h2 className="font-['Oswald'] text-2xl text-white uppercase mb-6">Driver Leads</h2>
            <Card className="bg-slate-900 border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Phone</TableHead>
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Experience</TableHead>
                    <TableHead className="text-slate-400">Zip</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) =>
                  <TableRow key={lead.id} className="border-slate-800">
                      <TableCell className="text-white font-medium">{lead.full_name}</TableCell>
                      <TableCell className="text-slate-400">
                        <a href={`tel:${lead.phone}`} className="text-blue-400 hover:text-blue-300">{lead.phone}</a>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        <a href={`mailto:${lead.email}`} className="text-blue-400 hover:text-blue-300">{lead.email}</a>
                      </TableCell>
                      <TableCell className="text-slate-400">{lead.cdl_experience} yrs</TableCell>
                      <TableCell className="text-slate-400">{lead.zip_code}</TableCell>
                      <TableCell>
                        <Badge className={lead.status === 'new' ? 'bg-amber-600' : 'bg-slate-600'}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-red-400 hover:text-red-300">

                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                  {leads.length === 0 &&
                  <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                        No leads yet
                      </TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Info Requests Tab */}
          <TabsContent value="requests">
            <h2 className="font-['Oswald'] text-2xl text-white uppercase mb-6">Info Requests</h2>
            <Card className="bg-slate-900 border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Phone</TableHead>
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Preferred Contact</TableHead>
                    <TableHead className="text-slate-400">Message</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {infoRequests.map((req) =>
                  <TableRow key={req.id} className="border-slate-800">
                      <TableCell className="text-white font-medium">{req.full_name}</TableCell>
                      <TableCell className="text-slate-400">
                        <a href={`tel:${req.phone}`} className="text-blue-400 hover:text-blue-300">{req.phone}</a>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        <a href={`mailto:${req.email}`} className="text-blue-400 hover:text-blue-300">{req.email}</a>
                      </TableCell>
                      <TableCell className="text-slate-400 capitalize">{req.preferred_contact}</TableCell>
                      <TableCell className="text-slate-400 max-w-[200px] truncate">{req.message || '-'}</TableCell>
                      <TableCell>
                        <Badge className={req.status === 'pending' ? 'bg-amber-600' : 'bg-green-600'}>
                          {req.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )}
                  {infoRequests.length === 0 &&
                  <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                        No info requests yet
                      </TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <h2 className="font-['Oswald'] text-2xl text-white uppercase mb-6">Site Settings</h2>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Site Name (Domain Name)</Label>
                    <Input
                      value={siteConfig.site_name}
                      onChange={(e) => setSiteConfig({ ...siteConfig, site_name: e.target.value })}
                      className="form-input"
                      placeholder="CDL Career Hub" />

                    <p className="text-xs text-slate-500">This is your main brand name displayed on the site</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Powered By (LLC Name)</Label>
                    <Input
                      value={siteConfig.powered_by_name}
                      onChange={(e) => setSiteConfig({ ...siteConfig, powered_by_name: e.target.value })}
                      className="form-input"
                      placeholder="Skillconnect LLC" />

                    <p className="text-xs text-slate-500">Shown in small print at the bottom of the page</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Phone Number</Label>
                    <Input
                      value={siteConfig.phone}
                      onChange={(e) => setSiteConfig({ ...siteConfig, phone: e.target.value })}
                      className="form-input"
                      placeholder="(479) 977-6813" />

                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Email</Label>
                    <Input
                      value={siteConfig.email}
                      onChange={(e) => setSiteConfig({ ...siteConfig, email: e.target.value })}
                      className="form-input"
                      placeholder="recruiting@example.com" />

                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Quick Apply URL (IntelliApp)</Label>
                  <Input
                    value={siteConfig.quick_app_url}
                    onChange={(e) => setSiteConfig({ ...siteConfig, quick_app_url: e.target.value })}
                    className="form-input"
                    placeholder="https://intelliapp.driverapponline.com/m/..." />

                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Application Limit</Label>
                    <Input
                      type="number"
                      value={siteConfig.application_limit}
                      onChange={(e) => setSiteConfig({ ...siteConfig, application_limit: parseInt(e.target.value) || 100 })}
                      className="form-input"
                      placeholder="100" />

                    <p className="text-xs text-slate-500">Max applications before the form is disabled</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Applications Used</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={siteConfig.applications_used}
                        onChange={(e) => setSiteConfig({ ...siteConfig, applications_used: parseInt(e.target.value) || 0 })}
                        className="form-input"
                        placeholder="0" />

                      <Button onClick={handleResetCounter} className="btn-secondary whitespace-nowrap">
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveConfig} disabled={isSavingConfig} className="btn-primary">
                    <Save className="w-4 h-4 mr-2" />
                    {isSavingConfig ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>);

};

// ============== HOME PAGE ==============
const HomePage = ({ config }) => {
  const [scrolled, setScrolled] = useState(false);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash navigation on page load
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        await axios.post(`${API}/jobs/seed`);
        const response = await axios.get(`${API}/jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
  }, []);

  // Generate JobPosting schema for SEO
  const jobPostingSchema = jobs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": jobs.slice(0, 6).map((job, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "employmentType": job.job_type === "Full Time" ? "FULL_TIME" : job.job_type === "Part Time" ? "PART_TIME" : "CONTRACTOR",
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressRegion": job.location,
            "addressCountry": "US"
          }
        },
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": {
            "@type": "QuantitativeValue",
            "value": job.pay
          }
        },
        "hiringOrganization": {
          "@type": "Organization",
          "name": config.site_name
        },
        "datePosted": new Date().toISOString().split('T')[0]
      }
    }))
  } : null;

  return (
    <div className="min-h-screen bg-slate-950">
      <SEOHead
        title={`${config.site_name} | CDL Jobs Nationwide | Top Trucking Careers`}
        description="Find the best CDL truck driving jobs nationwide. Connect with 30+ top trucking companies. OTR, Regional, Local & Dedicated routes. High pay, full benefits, home time. Apply now!"
        path="/" />

      {jobPostingSchema &&
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }} />
      }
      <Header scrolled={scrolled} config={config} isHomePage={true} />
      <main>
        <HeroSection config={config} />
        <BenefitsSection />
        <JobsSection jobs={jobs} config={config} />
        <ApplicationSection config={config} />
      </main>
      <Footer config={config} />
    </div>);

};

// ============== MAIN APP ==============
function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/config`);
      setConfig(response.data);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <div className="App" data-testid="app-container">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage config={config} />} />
          <Route path="/request-info" element={<RequestInfoPage config={config} />} />
          <Route path="/admin" element={<AdminPage config={config} refreshConfig={fetchConfig} />} />
        </Routes>
      </BrowserRouter>
    </div>);

}

export default App;