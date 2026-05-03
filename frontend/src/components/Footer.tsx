import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Instagram, Twitter, Youtube, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a201d] border-t border-white/10">
      <div className="max-w-[1440px] mx-auto section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#83f0c7] to-[#1d4c43] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#fffefa]">
                ECO<span className="text-[#83f0c7]">LOOP</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              AI-powered eco-friendly customized t-shirt platform. Design with nature, wear with purpose. Every thread tells a story of sustainability.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-[#83f0c7] hover:bg-[#83f0c7]/10 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-[#83f0c7] hover:bg-[#83f0c7]/10 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-[#83f0c7] hover:bg-[#83f0c7]/10 transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#fffefa] mb-6">Shop</h4>
            <ul className="space-y-4">
              {['All Products', 'AI Design Studio', 'New Arrivals', 'Best Sellers', 'Custom Orders'].map((item) => (
                <li key={item}>
                  <Link
                    to={item === 'All Products' ? '/products' : item === 'AI Design Studio' ? '/design-studio' : '/products'}
                    className="text-sm text-white/50 hover:text-[#83f0c7] transition-colors flex items-center gap-1 group"
                  >
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sustainability */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#fffefa] mb-6">Sustainability</h4>
            <ul className="space-y-4">
              {[
                { label: 'Our Materials', href: '#' },
                { label: 'Carbon Footprint Report', href: '#' },
                { label: 'Circular Fashion Initiative', href: '#' },
                { label: 'Reforestation Partnership', href: '#' },
                { label: 'Impact Dashboard', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-white/50 hover:text-[#83f0c7] transition-colors flex items-center gap-1 group"
                  >
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#fffefa] mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#83f0c7] mt-0.5 shrink-0" />
                <span className="text-sm text-white/50">
                  Amrutvahini College of Engineering,<br />
                  Sangamner, Maharashtra 422608
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#83f0c7] shrink-0" />
                <span className="text-sm text-white/50">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#83f0c7] shrink-0" />
                <span className="text-sm text-white/50">hello@ecoloop.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; 2026 ECOLOOP. All rights reserved. Made with 💚 for the planet.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-white/40 hover:text-[#83f0c7] transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-white/40 hover:text-[#83f0c7] transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-white/40 hover:text-[#83f0c7] transition-colors">Shipping Info</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
