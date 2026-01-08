import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { MapPin, Camera, Truck, Users, BarChart3, Shield } from "lucide-react";
const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen page-bg-hero">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04), rgba(0,0,0,0.04))' }} />

      <div className="relative container px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-block bg-black/40 backdrop-blur-md rounded-2xl p-8 px-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 text-white drop-shadow-lg">
              Smart Sewage & Waste Management
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto">
              Connecting communities across The Gambia for cleaner, healthier environments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                Get Started Today
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 shadow-medium">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-8 hover:shadow-strong transition-all duration-300 hover:-translate-y-1 bg-white/10 text-white backdrop-blur border border-white/10 hover:border-primary/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Residents</h3>
              <p className="text-white/85 mb-6">
                Book sewage disposal services and report illegal dumping in your community
              </p>
              <Button variant="gambian" className="w-full" onClick={() => navigate('/signup?role=resident')}>
                Access Resident Portal
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-strong transition-all duration-300 hover:-translate-y-1 bg-white/10 text-white backdrop-blur border border-white/10 hover:border-secondary/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-secondary rounded-2xl flex items-center justify-center">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Collectors</h3>
              <p className="text-white/85 mb-6">
                Receive job assignments and track your collection routes efficiently
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" className="w-full" onClick={() => navigate('/login?role=collector')}>
                  Collector Dashboard
                </Button>
                
              </div>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-strong transition-all duration-300 hover:-translate-y-1 bg-white/10 text-white backdrop-blur border border-white/10 hover:border-accent/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Administrators</h3>
              <p className="text-white/85 mb-6">
                Monitor operations and generate reports for better city management
              </p>
              <Button variant="accent" className="w-full" onClick={() => navigate('/login?role=admin')}>
                Admin Console
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-white/85">Active Residents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-2">50+</div>
            <div className="text-sm text-white/85">Collection Trucks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">1,200+</div>
            <div className="text-sm text-white/85">Jobs Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">12</div>
            <div className="text-sm text-white/85">Regions Covered</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;