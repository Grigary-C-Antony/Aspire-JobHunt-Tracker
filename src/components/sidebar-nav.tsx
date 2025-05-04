import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  ListTodo,
  Calendar,
  BarChart2,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "./theme-provider";

interface SidebarNavProps {
  className?: string;
}

const SidebarNav = ({ className }: SidebarNavProps) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(!isMobile);
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !isOpen) setIsOpen(true);
      if (mobile && isOpen) setIsOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Applications",
      href: "/applications",
      icon: FileText,
    },
    {
      name: "Board",
      href: "/board",
      icon: ListTodo,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
    },
    {
      name: "Statistics",
      href: "/statistics",
      icon: BarChart2,
    },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "fixed top-4 left-4 z-50 md:hidden",
          isOpen ? "left-[250px]" : "left-4"
        )}
      >
        <Menu className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Aspire</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <ModeToggle />
            <Link
              to="/settings"
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                location.pathname === "/settings"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>

          <div className="flex items-center px-4 py-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium">🐦‍🔥</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium" contentEditable>
                John Doe
              </p>
              <p className="text-xs text-sidebar-foreground/60">Job Seeker</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarNav;
