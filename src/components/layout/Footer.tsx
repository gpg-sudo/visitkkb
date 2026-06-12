import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        {/* Top Section: Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Column 1: Plan Your Trip */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-emerald-400">Plan Your Trip</h3>
            <ul className="space-y-4">
              <li><Link href="/activities/all" className="text-gray-300 hover:text-white hover:underline transition-all">Things do to</Link></li>
              <li><Link href="/stays" className="text-gray-300 hover:text-white hover:underline transition-all">Accommodation</Link></li>
              <li><Link href="/dining" className="text-gray-300 hover:text-white hover:underline transition-all">Eat & Drink</Link></li>
              <li><Link href="/events" className="text-gray-300 hover:text-white hover:underline transition-all">Events</Link></li>
              <li><Link href="/plan" className="text-gray-300 hover:text-white hover:underline transition-all">Itineraries</Link></li>
            </ul>
          </div>

          {/* Column 2: Community */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-emerald-400">Community</h3>
            <ul className="space-y-4">
              <li><Link href="/history" className="text-gray-300 hover:text-white hover:underline transition-all">History & Heritage</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white hover:underline transition-all">Stories & Guides</Link></li>
              <li><Link href="/dashboard/register" className="text-gray-300 hover:text-white hover:underline transition-all">List Your Business</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white hover:underline transition-all">Member Login</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-emerald-400">VisitKKB</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-300 hover:text-white hover:underline transition-all">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white hover:underline transition-all">Contact Us</Link></li>
              <li className="flex items-start gap-3 text-gray-300">
                <MapPin className="h-5 w-5 mt-1 text-emerald-500 shrink-0" />
                <span>Jalan Dato Tabal, Kuala Kubu Bharu,<br />Selangor, Malaysia</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Mail className="h-5 w-5 text-emerald-500 shrink-0" />
                <a href="mailto:hello@visitkkb.com" className="hover:text-white">hello@visitkkb.com</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-emerald-400">Stay Connected</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sign up for our newsletter to receive the latest updates, event news, and travel inspiration from KKB.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
              />
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Sign Up
              </Button>
            </div>

            <div className="pt-6">
              <h4 className="text-sm font-bold text-white mb-4 uppercase">Follow Us</h4>
              <div className="flex gap-4">
                <Link href="https://facebook.com" className="bg-white/10 p-2 rounded-full hover:bg-emerald-600 transition-colors">
                  <Facebook className="h-5 w-5 text-white" />
                </Link>
                <Link href="https://instagram.com" className="bg-white/10 p-2 rounded-full hover:bg-emerald-600 transition-colors">
                  <Instagram className="h-5 w-5 text-white" />
                </Link>
                <Link href="https://youtube.com" className="bg-white/10 p-2 rounded-full hover:bg-emerald-600 transition-colors">
                  <Youtube className="h-5 w-5 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <span>&copy; {new Date().getFullYear()} VisitKKB</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
          <div className="text-center md:text-right">
            <p className="font-semibold text-gray-400">Official Tourism Website of Kuala Kubu Bharu</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
