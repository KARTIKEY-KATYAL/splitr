"use client";

import React from "react";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useStoreUser } from "@/hooks/use-store-user";
import { BarLoader } from "react-spinners";
import { Authenticated, Unauthenticated } from "convex/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "./theme-switcher";

export default function Header() {
  const { isLoading } = useStoreUser();
  const path = usePathname();

  return (
    <header className="fixed top-0 w-full bg-slate-50 text-red-800 font-extrabold border-b backdrop-blur-enhanced z-50 animate-slide-down">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover-lift nav-item">
          <Image
            src={"/logos/logo.png"}
            alt="Splitr Logo"
            width={200}
            height={60}
            className="h-11 w-auto object-contain transition-all duration-300"
          />
        </Link>

        {path === "/" && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="nav-item text-sm font-medium"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="nav-item text-sm font-medium"
            >
              How It Works
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Authenticated>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="hidden md:inline-flex items-center gap-2 animate-hover-lift btn-blue-outline"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" className="md:hidden w-10 h-10 p-0 animate-hover-lift hover-glow">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>

            <ThemeSwitcher />

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 animate-hover-lift transition-all duration-300",
                  userButtonPopoverCard: "glass-effect shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </Authenticated>

          <Unauthenticated>
            <ThemeSwitcher />
            
            <SignInButton>
              <Button variant="ghost" className="animate-hover-lift btn-black-outline">
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton>
              <Button className="btn-red animate-hover-lift hover-glow">
                Get Started
              </Button>
            </SignUpButton>
          </Unauthenticated>
        </div>
      </nav>
      {isLoading && (
        <div className="w-full h-1 bg-muted animate-pulse">
          <BarLoader width={"100%"} color="hsl(var(--red))" height={4} />
        </div>
      )}
    </header>
  );
}
