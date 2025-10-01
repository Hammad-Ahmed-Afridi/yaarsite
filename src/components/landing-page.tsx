"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Menu, X, ChevronLeft, ChevronRight, Zap, Smartphone, Package, DollarSign, Share2 } from 'lucide-react'; // Replaced specific social icons with Share2

const sliderImages = [
  { src: "https://res.cloudinary.com/ddplxy4nd/image/upload/c_limit,h_186,w_195/Capture_jatcqb", alt: "Premium and professional website design" },
  { src: "https://placehold.co/1000x562/334155/e2e8f0?text=Modern+User+Interface", alt: "Modern user interface for easy management" },
  { src: "https://placehold.co/1000x562/475569/e2e8f0?text=Flawless+on+any+Device", alt: "Responsive design for all devices" },
];

const teamMembers = [
  { name: "John Doe", title: "Founder & CEO", description: "John leads our vision and strategy with a passion for innovation and a decade of experience in the industry.", imageUrl: "https://res.cloudinary.com/ddplxy4nd/image/upload/t_hello/WIN_20250917_12_08_30_Pro_gmys9h" },
  { name: "Jane Smith", title: "Lead Designer", description: "Jane is the creative force behind our designs, crafting beautiful and intuitive user experiences.", imageUrl: "https://res.cloudinary.com/ddplxy4nd/image/upload/t_hello/WIN_20250917_12_08_30_Pro_gmys9h" },
  { name: "Peter Jones", title: "Senior Developer", description: "Peter is a coding wizard who turns our designs into a seamless and robust reality.", imageUrl: "https://res.cloudinary.com/ddplxy4nd/image/upload/t_hello/WIN_20250917_12_08_30_Pro_gmys9h" },
  { name: "Emily White", title: "Marketing Specialist", description: "Emily ensures our message reaches the right audience, driving growth and engagement.", imageUrl: "https://res.cloudinary.com/ddplxy4nd/image/upload/t_hello/WIN_20250917_12_08_30_Pro_gmys9h" },
];

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLAnchorElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pricingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const faqRefs = useRef<(HTMLDivElement | null)[]>([]); // Changed from HTMLDetailsElement to HTMLDivElement

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Image Slider Logic
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(intervalId);
  }, []);

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + sliderImages.length) % sliderImages.length);
  };

  // Intersection Observer for scroll animations
  const createObserver = useCallback((elements: (HTMLElement | null)[], delayMultiplier: number = 0) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.remove('opacity-0', 'translate-y-5');
              entry.target.classList.add('animate-fade-in-up');
            }, index * delayMultiplier);
            observer.unobserve(entry.target); // Observe once
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => el && observer.observe(el));
    return () => elements.forEach((el) => el && observer.unobserve(el));
  }, []);

  useEffect(() => {
    // Hero section animations (staggered)
    const heroElements = [heroTitleRef.current, heroSubtitleRef.current, heroCtaRef.current];
    heroElements.forEach((el, index) => {
      if (el) {
        setTimeout(() => {
          el.classList.remove('opacity-0', 'translate-y-5');
          el.classList.add('animate-fade-in-up');
          if (el === heroCtaRef.current) {
            el.classList.add('animate-pulse-glow'); // Add pulse-glow to CTA
          }
        }, index * 200);
      }
    });

    // Other sections with staggered animations
    const cleanupFeatures = createObserver(featureRefs.current, 100);
    const cleanupTestimonials = createObserver(testimonialRefs.current, 100);
    const cleanupPricing = createObserver(pricingRefs.current, 100);
    const cleanupFaq = createObserver(faqRefs.current, 100);

    return () => {
      cleanupFeatures();
      cleanupTestimonials();
      cleanupPricing();
      cleanupFaq();
    };
  }, [createObserver]);

  return (
    <div className="bg-bg-deep text-text-primary font-sans min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-bg-deep/80 backdrop-blur-lg transition-all duration-300 border-b border-border-subtle">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center relative">
          <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
            Yaarsite
          </Link>

          <ul className="hidden lg:flex space-x-6 sm:space-x-10 items-center">
            <li><Link href="#features" className="text-sm sm:text-base font-medium text-text-secondary hover:text-text-primary transition-colors">Features</Link></li>
            <li><Link href="#testimonials" className="text-sm sm:text-base font-medium text-text-secondary hover:text-text-primary transition-colors">Testimonials</Link></li>
            <li><Link href="#pricing" className="text-sm sm:text-base font-medium text-text-secondary hover:text-text-primary transition-colors">Pricing</Link></li>
            <li><Link href="#faq" className="text-sm sm:text-base font-medium text-text-secondary hover:text-text-primary transition-colors">FAQ's</Link></li>
            <li><Link href="#our-team" className="text-sm sm:text-base font-medium text-text-secondary hover:text-text-primary transition-colors">Team</Link></li>
            <li>
              <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-accent-1 px-4 py-2 text-sm sm:text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                Get Started
              </Link>
            </li>
          </ul>

          <button id="mobile-menu-button" className="lg:hidden text-text-primary focus:outline-none z-20" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? (
              <X className="w-8 h-8" />
            ) : (
              <Menu className="w-8 h-8" />
            )}
          </button>

          {isMobileMenuOpen && (
            <div id="mobile-menu" className="fixed inset-0 w-full h-screen bg-bg-deep/95 backdrop-blur-lg z-10 flex flex-col items-center justify-center">
              <ul className="flex flex-col space-y-8 text-center text-xl">
                <li><Link href="#features" className="nav-link text-text-primary hover:text-accent-1 transition-colors" onClick={toggleMobileMenu}>Features</Link></li>
                <li><Link href="#testimonials" className="nav-link text-text-primary hover:text-accent-1 transition-colors" onClick={toggleMobileMenu}>Testimonials</Link></li>
                <li><Link href="#pricing" className="nav-link text-text-primary hover:text-accent-1 transition-colors" onClick={toggleMobileMenu}>Pricing</Link></li>
                <li><Link href="#faq" className="nav-link text-text-primary hover:text-accent-1 transition-colors" onClick={toggleMobileMenu}>FAQ's</Link></li>
                <li><Link href="#our-team" className="nav-link text-text-primary hover:text-accent-1 transition-colors" onClick={toggleMobileMenu}>Team</Link></li>
                <li>
                  <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-accent-1 px-6 py-3 text-base font-semibold text-white shadow-lg hover:scale-105 transition-transform duration-300" onClick={toggleMobileMenu}>
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-bg py-16 md:py-24 text-center overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 ref={heroTitleRef} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 opacity-0 translate-y-5">
              <span className="shimmer-text">Launch Your Store in Seconds</span>
            </h1>
            <p ref={heroSubtitleRef} className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-10 opacity-0 translate-y-5">
              Yaarsite makes it easy and fast to launch professional, beautiful stores. Perfect for any e-commerce seller looking to grow their business online without spending a single rupee.
            </p>
            <Link ref={heroCtaRef} href="/signup" className="inline-flex items-center justify-center rounded-full bg-accent-1 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-transform duration-300 hover:scale-105 hover:shadow-accent-1/20 opacity-0 translate-y-5">
              Start Now - It's Free
            </Link>
          </div>

          {/* Image Slider */}
          <div className="mt-16 relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border-subtle">
            <div id="slider-container" className="relative w-full aspect-[16/9]">
              {sliderImages.map((img, index) => (
                <Image
                  key={index}
                  src={img.src}
                  alt={img.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                  priority={index === 0} // Prioritize loading the first image
                />
              ))}
            </div>
            <button
              id="prev-btn"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors duration-200"
              onClick={goToPrevSlide}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              id="next-btn"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors duration-200"
              onClick={goToNextSlide}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 opacity-0 translate-y-5" ref={(el) => { if (el) featureRefs.current[0] = el; }}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
              Core Features
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">Everything you need to build and grow your online store, all in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Card 1 */}
            <div ref={(el) => { if (el) featureRefs.current[1] = el; }} className="bg-bg-deep p-8 rounded-2xl shadow-xl border border-border-subtle transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent-1/10 card-tilt opacity-0 translate-y-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-1/20 mb-6">
                <Zap className="w-6 h-6 text-accent-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text-primary">Quick Setup</h3>
              <p className="text-text-secondary">Launch your store in seconds without writing a single line of code. Our intuitive platform makes it simple.</p>
            </div>
            {/* Feature Card 2 */}
            <div ref={(el) => { if (el) featureRefs.current[2] = el; }} className="bg-bg-deep p-8 rounded-2xl shadow-xl border border-border-subtle transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent-1/10 card-tilt opacity-0 translate-y-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-1/20 mb-6">
                <Smartphone className="w-6 h-6 text-accent-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text-primary">Responsive Design</h3>
              <p className="text-text-secondary">Your website will look flawless on any device, from desktop to mobile, ensuring a great user experience.</p>
            </div>
            {/* Feature Card 3 */}
            <div ref={(el) => { if (el) featureRefs.current[3] = el; }} className="bg-bg-deep p-8 rounded-2xl shadow-xl border border-border-subtle transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent-1/10 card-tilt opacity-0 translate-y-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-1/20 mb-6">
                <Package className="w-6 h-6 text-accent-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text-primary">Seamless Management</h3>
              <p className="text-text-secondary">Easily add, edit, and organize products, process orders, and manage inventory from a single, intuitive dashboard.</p>
            </div>
            {/* Feature Card 4 */}
            <div ref={(el) => { if (el) featureRefs.current[4] = el; }} className="bg-bg-deep p-8 rounded-2xl shadow-xl border border-border-subtle transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent-1/10 card-tilt opacity-0 translate-y-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-1/20 mb-6">
                <DollarSign className="w-6 h-6 text-accent-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text-primary">Zero Transaction Fees</h3>
              <p className="text-text-secondary">Keep 100% of your earnings. We don't charge any transaction fees on your sales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-bg-deep">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 opacity-0 translate-y-5" ref={(el) => { if (el) testimonialRefs.current[0] = el; }}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
              What Our Customers Say
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">Hear from people who have successfully launched their business with YaarSite.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div ref={(el) => { if (el) testimonialRefs.current[1] = el; }} className="bg-bg-card p-8 rounded-2xl shadow-lg border border-border-subtle card-tilt opacity-0 translate-y-5">
              <p className="text-xl italic text-text-primary mb-4">"Yaarsite was a game-changer for my small business. The setup was incredibly easy, and my online store looks amazing. I couldn't be happier!"</p>
              <div className="flex items-center">
                <Image src="https://placehold.co/48x48/1a202d/94a3b8?text=JD" alt="Jane Doe profile" width={48} height={48} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <p className="font-semibold text-text-primary">Jane Doe</p>
                  <p className="text-sm text-text-secondary">Founder, Jane's Crafts</p>
                </div>
              </div>
            </div>
            <div ref={(el) => { if (el) testimonialRefs.current[2] = el; }} className="bg-bg-card p-8 rounded-2xl shadow-lg border border-border-subtle card-tilt opacity-0 translate-y-5">
              <p className="text-xl italic text-text-primary mb-4">"I had zero experience with websites, but YaarSite made the entire process so simple."</p>
              <div className="flex items-center">
                <Image src="https://placehold.co/48x48/1a202d/94a3b8?text=MJ" alt="Mike Johnson profile" width={48} height={48} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <p className="font-semibold text-text-primary">Mike Johnson</p>
                  <p className="text-sm text-text-secondary">Owner, Mike's Gadgets</p>
                </div>
              </div>
            </div>
            <div ref={(el) => { if (el) testimonialRefs.current[3] = el; }} className="bg-bg-card p-8 rounded-2xl shadow-lg border border-border-subtle card-tilt opacity-0 translate-y-5">
              <p className="text-xl italic text-text-primary mb-4">"The customer support is fantastic, and the platform is so intuitive. It's the best decision I've made for my online business."</p>
              <div className="flex items-center">
                <Image src="https://placehold.co/48x48/1a202d/94a3b8?text=LP" alt="Lisa Periz profile" width={48} height={48} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <p className="font-semibold text-text-primary">Lisa Periz</p>
                  <p className="text-sm text-text-secondary">Creator, The Art Shop</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 hero-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 opacity-0 translate-y-5" ref={(el) => { if (el) pricingRefs.current[0] = el; }}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
              Flexible Pricing Plans
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">Choose a plan that fits your business needs, with no hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Starter Plan */}
            <div ref={(el) => { if (el) pricingRefs.current[1] = el; }} className="bg-bg-card p-8 rounded-2xl shadow-xl border border-border-subtle transition-transform duration-300 hover:scale-105 opacity-0 translate-y-5">
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Starter</h3>
              <p className="text-5xl font-extrabold text-accent-1 mb-4">Free</p>
              <p className="text-text-secondary mb-8">For new businesses just getting started online.</p>
              <Link href="/signup" className="block text-center rounded-full bg-accent-1 px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-accent-1/20">
                Get Started
              </Link>
            </div>
            {/* Pro Plan */}
            <div ref={(el) => { if (el) pricingRefs.current[2] = el; }} className="bg-bg-deep p-10 rounded-2xl shadow-2xl border-4 border-accent-1 transition-transform duration-300 hover:scale-105 transform scale-105 opacity-0 translate-y-5">
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Pro</h3>
              <p className="text-5xl font-extrabold text-accent-1 mb-4">Rs 2000</p>
              <p className="text-text-secondary mb-8">Unlock advanced features and scale your business.</p>
              <Link href="/signup" className="block text-center rounded-full bg-accent-1 px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-accent-1/20">
                Choose Pro
              </Link>
            </div>
            {/* Business Plan */}
            <div ref={(el) => { if (el) pricingRefs.current[3] = el; }} className="bg-bg-card p-8 rounded-2xl shadow-xl border border-border-subtle transition-transform duration-300 hover:scale-105 opacity-0 translate-y-5">
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Business</h3>
              <p className="text-5xl font-extrabold text-accent-1 mb-4">Rs 30000</p>
              <p className="text-text-secondary mb-8">For growing stores with more control and power.</p>
              <Link href="/signup" className="block text-center rounded-full bg-accent-1 px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-accent-1/20">
                Choose Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 opacity-0 translate-y-5" ref={(el) => { if (el) faqRefs.current[0] = el; }}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">Got a question? We've got answers.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" ref={(el) => { if (el) faqRefs.current[1] = el as HTMLDivElement; }} className="bg-bg-deep p-6 rounded-2xl shadow-lg border border-border-subtle cursor-pointer transition-transform duration-200 hover:scale-[1.02] opacity-0 translate-y-5">
                <AccordionTrigger className="text-lg font-semibold text-text-primary hover:no-underline">How fast can I set up my store?</AccordionTrigger>
                <AccordionContent className="mt-4 text-text-secondary leading-relaxed">
                  With Yaarsite, you can launch your store in seconds, literally! Our intuitive interface guides you through the process step-by-step to get you online quickly.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" ref={(el) => { if (el) faqRefs.current[2] = el as HTMLDivElement; }} className="bg-bg-deep p-6 rounded-2xl shadow-lg border border-border-subtle cursor-pointer transition-transform duration-200 hover:scale-[1.02] opacity-0 translate-y-5">
                <AccordionTrigger className="text-lg font-semibold text-text-primary hover:no-underline">Do I need coding knowledge?</AccordionTrigger>
                <AccordionContent className="mt-4 text-text-secondary leading-relaxed">
                  No coding required! Yaarsite is built for everyone, from beginners to seasoned business owners. You can easily build your store with our powerful tools.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" ref={(el) => { if (el) faqRefs.current[3] = el as HTMLDivElement; }} className="bg-bg-deep p-6 rounded-2xl shadow-lg border border-border-subtle cursor-pointer transition-transform duration-200 hover:scale-[1.02] opacity-0 translate-y-5">
                <AccordionTrigger className="text-lg font-semibold text-text-primary hover:no-underline">Is it mobile friendly?</AccordionTrigger>
                <AccordionContent className="mt-4 text-text-secondary leading-relaxed">
                  Yes, your store will look beautiful and function perfectly on all devices, from desktops to tablets and smartphones. Our designs are optimized for responsiveness right out of the box.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" ref={(el) => { if (el) faqRefs.current[4] = el as HTMLDivElement; }} className="bg-bg-deep p-6 rounded-2xl shadow-lg border border-border-subtle cursor-pointer transition-transform duration-200 hover:scale-[1.02] opacity-0 translate-y-5">
                <AccordionTrigger className="text-lg font-semibold text-text-primary hover:no-underline">How much does it cost to launch a website?</AccordionTrigger>
                <AccordionContent className="mt-4 text-text-secondary leading-relaxed">
                  With Yaarsite, you can get started completely free of charge. Choose our Starter plan and launch your store without any costs.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="our-team" className="py-16 sm:py-24 bg-bg-deep/80 backdrop-blur-lg border-b border-border-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 opacity-0 translate-y-5" ref={(el) => { if (el) featureRefs.current[5] = el; }}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">
              Meet Our Amazing Team
            </h2>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
              We are a passionate group of students working together to build great things.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} ref={(el) => { if (el) featureRefs.current[6 + index] = el; }} className="relative bg-bg-deep/50 rounded-xl p-6 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group opacity-0 translate-y-5">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-1 to-accent-2 opacity-0 transition-opacity duration-300 group-hover:opacity-10 blur-xl"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <Image src={member.imageUrl} alt={member.name} width={96} height={96} className="w-24 h-24 rounded-full border-2 border-accent-1 mb-4 shadow-md object-cover" />
                  <h3 className="text-xl font-bold text-text-primary">{member.name}</h3>
                  <p className="text-sm text-text-secondary">{member.title}</p>
                  <p className="mt-4 text-sm text-text-subtle">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Buttons - Fixed Position */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-40">
        <a href="https://wa.me/yourphonenumber" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-white icon-container">
          <Share2 className="text-green-500 w-8 h-8" /> {/* Replaced Whatsapp with Share2 */}
        </a>
        <a href="https://www.instagram.com/yourusername" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-white icon-container">
          <Share2 className="w-8 h-8" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} /> {/* Replaced Instagram with Share2 */}
        </a>
        <a href="https://www.tiktok.com/@yourusername" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-white icon-container">
          <Share2 className="text-black w-8 h-8" /> {/* Replaced Tiktok with Share2 */}
        </a>
        <a href="https://www.facebook.com/yourpagename" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-white icon-container">
          <Share2 className="text-blue-700 w-8 h-8" /> {/* Replaced Facebook with Share2 */}
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-bg-deep py-12 border-t border-border-subtle text-center text-text-secondary">
        <ul className="flex justify-center space-x-2 mb-6">
          <li><Link href="#features" className="text-sm sm:text-base font-medium text-text-secondary hover:text-text-primary transition-colors">Features</Link></li>
          <li><Link href="#testimonials" className="text-sm sm:text-base font-medium text-text-secondary hover:text-text-primary transition-colors">Testimonials</Link></li>
          <li><Link href="#pricing" className="text-sm sm:text-base font-medium text-text-secondary hover:text-text-primary transition-colors">Pricing</Link></li>
          <li><Link href="#faq" className="text-sm sm:text-base font-medium text-text-secondary hover:text-text-primary transition-colors">FAQ's</Link></li>
          <li><Link href="#our-team" className="text-sm sm:text-base font-medium text-text-secondary hover:text-text-primary transition-colors">Team</Link></li>
        </ul>
        <p>&copy; 2025 Yaarsite. All rights reserved.</p>
      </footer>
    </div>
  );
}