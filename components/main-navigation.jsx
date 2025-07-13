"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Plus, 
  Users, 
  BarChart3, 
  Repeat, 
  CreditCard, 
  PieChart,
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MainNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/expenses/new", label: "Add Expense", icon: Plus, highlight: true },
    { href: "/groups", label: "Groups", icon: Users },
    { href: "/analytics", label: "Analytics", icon: BarChart3, badge: "New" },
    { href: "/recurring", label: "Recurring", icon: Repeat, badge: "New" },
    { href: "/settlements", label: "Settlements", icon: CreditCard },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <PieChart className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Splitr</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "relative animate-hover-lift",
                        item.highlight && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="ml-2 text-xs bg-green-100 text-green-800"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/analytics">
                <Sparkles className="h-4 w-4 mr-2" />
                Insights
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "relative",
                      item.highlight && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {item.label}
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="ml-1 text-xs bg-green-100 text-green-800"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
