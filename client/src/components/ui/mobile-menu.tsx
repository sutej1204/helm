import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  FileSearch,
  GitMerge,
  ClipboardList,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import helmLogo from "@assets/Helm_logo_white-removebg-preview_1769959269995.png";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Data Import", href: "/integrations", icon: Upload },
  { name: "Contract Ingestion", href: "/contract-ingestion", icon: FileSearch },
  { name: "Matching Engine", href: "/matching-engine", icon: GitMerge },
  { name: "Recovery Workflow", href: "/recovery-workflow", icon: ClipboardList },
  { name: "Landing Page", href: "/", icon: Home },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-1.5 mr-2">
              <img src={helmLogo} alt="Helm" className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Helm</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            <Menu className="h-6 w-6 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className={cn("fixed inset-0 z-40 bg-card p-4 md:hidden", isOpen ? "block" : "hidden")}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-1.5 mr-2">
              <img src={helmLogo} alt="Helm" className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Helm</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close menu">
            <X className="h-6 w-6 text-muted-foreground" />
          </Button>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    isActive ? "bg-emerald-500/10 text-emerald-400" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    "group flex items-center px-3 py-3 text-base font-medium rounded-md cursor-pointer"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default MobileMenu;
