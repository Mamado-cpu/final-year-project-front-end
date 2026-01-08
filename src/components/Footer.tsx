import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-hero flex items-center justify-center">
                <span className="text-white font-bold">🇬🇲</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">SmartWaste Gambia</h3>
                <p className="text-sm opacity-80">Clean Communities, Bright Future</p>
              </div>
            </div>
            <p className="text-background/80 mb-6 max-w-md">
              Revolutionizing waste management across The Gambia through innovative technology 
              and community engagement for a cleaner, healthier environment.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="text-background hover:bg-card/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:bg-card/10">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-background/80">
              <li><Link to="/signup?role=resident" className="hover:text-background transition-colors">Resident Portal</Link></li>
              <li><Link to="/login?role=collector" className="hover:text-background transition-colors">Collector Dashboard</Link></li>
              <li><Link to="/login?role=admin" className="hover:text-background transition-colors">Admin Console</Link></li>
              <li><a href="#" className="hover:text-background transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-background/80">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Banjul, The Gambia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+220 XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">info@smartwaste.gm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center text-background/60">
          <p>&copy; 2024 SmartWaste Gambia. All rights reserved. Built with 💚 for The Gambia.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;