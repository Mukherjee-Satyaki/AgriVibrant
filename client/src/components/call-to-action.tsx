import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CallToAction() {
  const stats = [
    { value: "15,000+", label: "Registered Farmers" },
    { value: "₹120M+", label: "Products Traded" },
    { value: "2,500+", label: "Active Auctions" },
    { value: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading font-bold text-2xl md:text-3xl mb-6">
          Ready to Transform Your Agricultural Business?
        </h2>
        <p className="max-w-2xl mx-auto mb-8 text-white/90">
          Join thousands of farmers and agricultural businesses who are already benefiting from our platform.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="px-6 py-3 bg-white text-primary-600 hover:bg-neutral-100 font-ui font-semibold rounded-lg transition">
            Create Free Account
          </Button>
          <Link href="/marketplace">
            <Button variant="outline" className="px-6 py-3 bg-transparent border-2 border-white hover:bg-white/10 font-ui font-semibold rounded-lg transition">
              Learn More
            </Button>
          </Link>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
