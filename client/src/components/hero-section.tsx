import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary-500 to-primary-600 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="font-heading font-bold text-3xl md:text-5xl leading-tight mb-6">
            Revolutionizing Agricultural Commerce
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Connect, trade, and grow with our comprehensive platform designed for farmers, buyers, and agricultural enthusiasts.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/marketplace">
              <Button className="px-6 py-3 bg-white text-primary-600 hover:bg-gray-100 font-ui font-semibold rounded-lg transition">
                Get Started
              </Button>
            </Link>
            <Button className="px-6 py-3 bg-transparent border-2 border-white hover:bg-white/10 font-ui font-semibold rounded-lg transition">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-1/3 h-full hidden lg:block overflow-hidden opacity-20 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
      </div>
    </section>
  );
}
