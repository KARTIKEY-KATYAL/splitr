import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { FEATURES, STEPS, TESTIMONIALS } from "@/lib/landing";

export default function LandingPage() {
  return (
    <div className="flex flex-col pt-16">
      {/* ───── Hero ───── */}
      <section className="mt-20 pb-12 space-y-10 md:space-y-15 px-5">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-8">
          <Badge variant="outline" className="badge-blue-outline animate-bounce-in-down">
            Split expenses. Simplify life.
          </Badge>

          <h1 className="title-black mx-auto max-w-6xl text-4xl font-bold md:text-8xl animate-slide-up-fade text-shadow animate-stagger-1">
            The smartest way to split expenses with friends
          </h1>

          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed animate-slide-up-fade animate-stagger-2">
            Track shared expenses, split bills effortlessly, and settle up
            quickly. Never worry about who owes who again.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row justify-center animate-slide-up-fade animate-stagger-3">
            <Button
              asChild
              size="lg"
              className="btn-red animate-hover-lift hover-glow magnetic-button"
            >
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="btn-blue-outline animate-hover-lift animate-hover-scale"
            >
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl overflow-hidden rounded-xl shadow-xl animate-scale-in animate-stagger-4">
          <div className="bg-black p-1 aspect-[16/9]">
            <Image
              src="/hero.png"
              width={1280}
              height={720}
              alt="Banner"
              className="rounded-lg mx-auto animate-fade-in animate-stagger-5"
              priority
            />
          </div>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge variant="outline" className="badge-blue-outline animate-bounce-in-down">
            Features
          </Badge>
          <h2 className="title-blue mt-2 text-3xl md:text-4xl font-bold animate-slide-up-fade animate-stagger-1">
            Everything you need to split expenses
          </h2>
          <p className="mx-auto mt-3 max-w-[700px] text-muted-foreground md:text-xl/relaxed animate-slide-up-fade animate-stagger-2">
            Our platform provides all the tools you need to handle shared
            expenses with ease.
          </p>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ title, Icon, bg, color, description }, index) => (
              <Card
                key={title}
                className={`card-enhanced flex flex-col items-center space-y-4 p-6 text-center animate-hover-lift animate-scale-in animate-stagger-${index + 3} hover-glow transition-all duration-300`}
              >
                <div className={`rounded-full p-3 ${bg} animate-floating animate-hover-rotate`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>

                <h3 className="text-xl font-bold animate-fade-in animate-stagger-4">{title}</h3>
                <p className="text-muted-foreground animate-fade-in animate-stagger-5">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge variant="outline" className="badge-red-outline animate-fade-in">
            How It Works
          </Badge>
          <h2 className="title-red mt-2 text-3xl md:text-4xl font-bold">
            Splitting expenses has never been easier
          </h2>
          <p className="mx-auto mt-3 max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Follow these simple steps to start tracking and splitting expenses
            with friends.
          </p>

          <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
            {STEPS.map(({ label, title, description }) => (
              <div key={label} className="flex flex-col items-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-muted text-xl font-bold text-red">
                  {label}
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground text-center">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Testimonials ───── */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge variant="outline" className="badge-black-outline">
            Testimonials
          </Badge>
          <h2 className="title-black mt-2 text-3xl md:text-4xl font-bold">
            What our users are saying
          </h2>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, image }) => (
              <Card key={name} className="flex flex-col justify-between card-enhanced hover-lift">
                <CardContent className="space-y-4 p-6">
                  <p className="text-muted-foreground">{quote}</p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={image} alt={name} />
                      <AvatarFallback className="uppercase">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">{role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Call‑to‑Action ───── */}
      <section className="py-20 bg-blue">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-blue-foreground">
            Ready to simplify expense sharing?
          </h2>
          <p className="mx-auto max-w-[600px] text-blue-foreground/80 md:text-xl/relaxed">
            Join thousands of users who have made splitting expenses
            stress‑free.
          </p>
          <Button asChild size="lg" className="btn-red animate-hover-lift magnetic-button">
            <Link href="/dashboard">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t bg-muted/50 py-12 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Splitr. All rights reserved.
      </footer>
    </div>
  );
}
