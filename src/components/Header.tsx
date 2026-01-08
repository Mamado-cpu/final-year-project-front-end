import { Button } from "@/components/ui/button";
import { Menu, User, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b page-bg-header backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <span className="text-white font-bold text-sm">🇬🇲</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">SmartWaste</h1>
              <p className="text-xs text-muted-foreground">The Gambia</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;