"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Only render after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // Return a skeleton during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 p-0 hover-lift hover-glow focus-ring"
        disabled
      >
        <Sun className="h-5 w-5 transition-all duration-300" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
      className="w-10 h-10 p-0 hover-lift hover-glow focus-ring animate-fade-in"
    >
      <div className="relative overflow-hidden">
        {theme === "dark" ? (
          <Sun className="h-5 w-5 transition-all duration-500 rotate-0 scale-100 animate-scale-in" />
        ) : (
          <Moon className="h-5 w-5 transition-all duration-500 rotate-0 scale-100 animate-scale-in" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
