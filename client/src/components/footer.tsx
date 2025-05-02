import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <i className="fas fa-leaf text-primary-500 text-2xl"></i>
              <span className="font-heading font-bold text-xl">
                Agri<span className="text-primary-500">Vibrant</span>
              </span>
            </div>
            <p className="text-neutral-400 mb-6">
              Revolutionizing agricultural commerce through technology and innovation.
            </p>
            <div className="flex space-x-4">
              <Link href="/" className="text-neutral-400 hover:text-primary-500 transition">
                <i className="fab fa-facebook-f"></i>
              </Link>
              <Link href="/" className="text-neutral-400 hover:text-primary-500 transition">
                <i className="fab fa-twitter"></i>
              </Link>
              <Link href="/" className="text-neutral-400 hover:text-primary-500 transition">
                <i className="fab fa-instagram"></i>
              </Link>
              <Link href="/" className="text-neutral-400 hover:text-primary-500 transition">
                <i className="fab fa-linkedin-in"></i>
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-primary-500 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-neutral-400 hover:text-primary-500 transition">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/bidding" className="text-neutral-400 hover:text-primary-500 transition">
                  Digital Bidding
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="text-neutral-400 hover:text-primary-500 transition">
                  Agri Assistant
                </Link>
              </li>
              <li>
                <Link href="/" className="text-neutral-400 hover:text-primary-500 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="text-neutral-400 hover:text-primary-500 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/marketplace" className="text-neutral-400 hover:text-primary-500 transition">
                  Market Price Analysis
                </Link>
              </li>
              <li>
                <Link href="/bidding" className="text-neutral-400 hover:text-primary-500 transition">
                  Auction Management
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="text-neutral-400 hover:text-primary-500 transition">
                  Agricultural Consulting
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="text-neutral-400 hover:text-primary-500 transition">
                  Crop Information
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="text-neutral-400 hover:text-primary-500 transition">
                  Weather Forecasts
                </Link>
              </li>
              <li>
                <Link href="/" className="text-neutral-400 hover:text-primary-500 transition">
                  Financial Services
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <i className="fas fa-map-marker-alt mt-1"></i>
                <span className="text-neutral-400">
                  123 Agriculture Drive, Farmland Valley, IN 56789
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-phone-alt"></i>
                <span className="text-neutral-400">+91 1234 567890</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-envelope"></i>
                <span className="text-neutral-400">info@agrivibrant.com</span>
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="font-medium mb-3">Subscribe to Newsletter</h5>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-grow px-4 py-2 bg-neutral-800 text-white rounded-l-lg focus:outline-none"
                />
                <button className="px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-r-lg transition">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
          <p>© {new Date().getFullYear()} Agri Vibrant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
