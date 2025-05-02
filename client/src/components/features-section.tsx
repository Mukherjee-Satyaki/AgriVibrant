import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FeaturesSection() {
  const features = [
    {
      id: "marketplace",
      title: "Agricultural Marketplace",
      description: "Register and track market values of agricultural products. Connect directly with buyers and stay updated with current prices.",
      icon: "fas fa-store",
      iconColor: "text-primary-500",
      linkText: "Explore Marketplace",
      linkPath: "/marketplace",
      linkColor: "text-primary-500 hover:text-primary-600",
      badge: {
        text: "2500+ Products",
        icon: "fas fa-tag",
        color: "bg-primary-50 text-primary-600"
      },
      image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9"
    },
    {
      id: "bidding",
      title: "Digital Bidding",
      description: "Auction your agricultural products to the highest bidder or find great deals on premium produce through our bidding platform.",
      icon: "fas fa-gavel",
      iconColor: "text-[#FF9800]",
      linkText: "Join Auctions",
      linkPath: "/bidding",
      linkColor: "text-[#FF9800] hover:text-amber-600",
      badge: {
        text: "124 Live Auctions",
        icon: "fas fa-clock",
        color: "bg-orange-50 text-[#FF9800]"
      },
      image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae"
    },
    {
      id: "chatbot",
      title: "AgriBot Assistant",
      description: "Get instant answers to your agricultural questions. Our AI-powered chatbot provides information on farming techniques, crop diseases, and more.",
      icon: "fas fa-robot",
      iconColor: "text-[#8BC34A]",
      linkText: "Ask AgriBot",
      linkPath: "/chatbot",
      linkColor: "text-[#8BC34A] hover:text-green-600",
      badge: {
        text: "10K+ Topics",
        icon: "fas fa-database",
        color: "bg-green-50 text-[#8BC34A]"
      },
      image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-12">
          Explore Our Agricultural Solutions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.id}
              id={feature.id}
              className="feature-card border-neutral-100 shadow-lg overflow-hidden transition duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <i className={`${feature.icon} text-2xl ${feature.iconColor}`}></i>
                  <h3 className="font-heading font-bold text-xl">{feature.title}</h3>
                </div>
                <p className="text-neutral-700 mb-6">
                  {feature.description}
                </p>
                <div className="flex justify-between items-center">
                  <Link href={feature.linkPath} className={`font-ui font-medium ${feature.linkColor} transition`}>
                    {feature.linkText}
                  </Link>
                  <Badge variant="outline" className={`${feature.badge.color} border-0 px-3 py-1 rounded-full text-sm font-ui`}>
                    <i className={`${feature.badge.icon} mr-1`}></i> {feature.badge.text}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
