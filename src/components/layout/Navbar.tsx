"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, User, Menu, Globe, Map, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

// Navigation Data
const thingsToDoLinks = [
  { label: "Adventure", href: "/activities/all?category=adventure" },
  { label: "Walking & Hiking", href: "/activities/all?category=hiking" },
  { label: "Water Sports", href: "/activities/all?category=water-sports" },
  { label: "Biking", href: "/activities/all?category=cycling" },
  { label: "Culture & Heritage", href: "/activities/all?category=culture" },
  { label: "Wellness & Relaxation", href: "/activities/all?category=wellness" },
  { label: "Family Fun", href: "/activities/all?category=family" },
  { label: "Nature & Wildlife", href: "/activities/all?category=nature" },
  { label: "View All Activities", href: "/activities/all" },
];

const accommodationLinks = [
  { label: "Hotels & Resorts", href: "/stays?type=HOTEL,RESORT" },
  { label: "Homestays", href: "/stays?type=HOMESTAY" },
  { label: "Nature & Camping", href: "/stays?type=CAMPING,GLAMPING,CHALET" },
  { label: "Hostels & Budget", href: "/stays?type=HOSTEL" },
  { label: "View All Stays", href: "/stays" },
];

const eatDrinkLinks = [
  { label: "Local Warung & Street Food", href: "/dining?type=WARUNG,STREET_FOOD" },
  { label: "Cafes & Coffee", href: "/dining?type=CAFE" },
  { label: "Restaurants", href: "/dining?type=RESTAURANT" },
  { label: "Mamak & Late Night", href: "/dining?type=MAMAK" },
  { label: "View All Dining", href: "/dining" },
];

const planLinks = [
  { label: "Getting Here", href: "/about#getting-here" },
  { label: "Weather & Best Time", href: "/about#weather" },
  { label: "Interactive Map", href: "/explore-map" },
  { label: "Search", href: "/search" },
];

const inspirationLinks = [
  { label: "Travel Blog", href: "/blog" },
  { label: "Upcoming Events", href: "/events" },
  { label: "Past Events", href: "/events/previous" },
  { label: "About KKB", href: "/about" },
  { label: "Our History", href: "/history" },
];

type NavMenuType = "plan" | "activities" | "stays" | "dining" | "inspiration" | null;

// Simple Dropdown Component
const DropdownMenu = ({ links }: { links: { label: string; href: string }[] }) => (
  <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[240px]">
    <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-2">
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="block px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  </div>
);

export function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<NavMenuType>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Determine if we need to close the menu
    if (isMobileMenuOpen || mobileExpandedMenu) {
      // Use setTimeout to avoid 'setState synchronously in effect' lint error
      const timer = setTimeout(() => {
        setIsMobileMenuOpen(false);
        setMobileExpandedMenu(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pathname, isMobileMenuOpen, mobileExpandedMenu]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      router.push("/account");
    } else {
      router.push("/login");
    }
  };

  const toggleMobileSubMenu = (menu: NavMenuType) => {
    setMobileExpandedMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b shadow-sm relative">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex flex-col items-center group">
              <span className="text-2xl font-serif font-bold tracking-tight text-primary leading-none group-hover:opacity-90 transition-opacity">
                VisitKKB
              </span>
              <div className="flex flex-col w-full items-center">
                <span className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground font-medium mt-1 group-hover:text-primary/70 transition-colors leading-none">
                  Pocketsize
                </span>
                <span className="text-[0.6rem] uppercase tracking-[0.5em] text-muted-foreground font-medium group-hover:text-primary/70 transition-colors leading-none ml-1">
                  Adventure
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {/* Plan */}
              <div className="relative group h-16 flex items-center">
                <Link
                  href="/about"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors rounded-md group-hover:bg-muted/50"
                >
                  Plan
                  <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
                </Link>
                <DropdownMenu links={planLinks} />
              </div>

              {/* Things To Do */}
              <div className="relative group h-16 flex items-center">
                <Link
                  href="/activities"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors rounded-md group-hover:bg-muted/50"
                >
                  Things To Do
                  <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
                </Link>
                <DropdownMenu links={thingsToDoLinks} />
              </div>

              {/* Accommodation */}
              <div className="relative group h-16 flex items-center">
                <Link
                  href="/stays"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors rounded-md group-hover:bg-muted/50"
                >
                  Accommodation
                  <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
                </Link>
                <DropdownMenu links={accommodationLinks} />
              </div>

              {/* Eat & Drink */}
              <div className="relative group h-16 flex items-center">
                <Link
                  href="/dining"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors rounded-md group-hover:bg-muted/50"
                >
                  Eat & Drink
                  <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
                </Link>
                <DropdownMenu links={eatDrinkLinks} />
              </div>

              {/* Inspiration */}
              <div className="relative group h-16 flex items-center">
                <Link
                  href="/blog"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors rounded-md group-hover:bg-muted/50"
                >
                  Inspiration
                  <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
                </Link>
                <DropdownMenu links={inspirationLinks} />
              </div>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center animate-in fade-in slide-in-from-right-4">
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-9 w-40 lg:w-48 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                />
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/70 hover:text-primary"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Language */}
            <button className="hidden lg:flex items-center gap-1 px-3 py-2 hover:bg-muted rounded-full transition-colors text-sm font-medium text-foreground/70 hover:text-primary">
              <Globe className="h-4 w-4" />
              <span>EN</span>
            </button>

            {/* Cart */}
            <CartButton onClick={() => setIsCartOpen(true)} />

            {/* Map */}
            <Link
              href="/explore-map"
              className={cn(
                "hidden sm:flex p-2 hover:bg-muted rounded-full transition-colors text-foreground/70 hover:text-primary",
                pathname === "/explore-map" && "bg-muted text-primary"
              )}
              aria-label="Explore Map"
            >
              <Map className="h-5 w-5" />
            </Link>

            {/* User */}
            <button
              onClick={handleUserClick}
              className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-full transition-colors text-foreground/70 hover:text-primary"
            >
              <User className="h-5 w-5" />
              <span className="hidden lg:block text-sm font-medium">
                {isAuthenticated ? "Account" : "Sign in"}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                const newState = !isMobileMenuOpen;
                console.log('Hamburger clicked, toggling from', isMobileMenuOpen, 'to', newState);
                setIsMobileMenuOpen(newState);
              }}
              className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors relative z-[80]"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              type="button"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 top-16 bg-black/30 z-[60]"
              onClick={() => {
                console.log('Backdrop clicked');
                setIsMobileMenuOpen(false);
              }}
              aria-hidden="true"
            />
            {/* Menu Content */}
            <div
              className="lg:hidden fixed inset-0 top-16 z-[70] bg-white overflow-y-auto shadow-lg"
              onClick={(e) => e.stopPropagation()}
              style={{
                minHeight: 'calc(100vh - 4rem)',
                maxHeight: 'calc(100vh - 4rem)'
              }}
            >
              <div className="container mx-auto p-4 pb-20 space-y-2">
                {/* Plan */}
                <div className="border-b border-border/40">
                  <button
                    onClick={() => {
                      console.log('Plan menu clicked');
                      toggleMobileSubMenu("plan");
                    }}
                    className="flex items-center justify-between w-full py-4 text-lg font-medium touch-manipulation"
                    type="button"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Plan
                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", mobileExpandedMenu === "plan" && "rotate-180")} />
                  </button>
                  {mobileExpandedMenu === "plan" && (
                    <div className="pb-4 space-y-1 animate-in slide-in-from-top-2">
                      {planLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="block py-2.5 px-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors touch-manipulation"
                          onClick={() => {
                            console.log('Plan link clicked:', link.href);
                            setIsMobileMenuOpen(false);
                          }}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Things To Do */}
                <div className="border-b border-border/40">
                  <button
                    onClick={() => {
                      console.log('Activities menu clicked');
                      toggleMobileSubMenu("activities");
                    }}
                    className="flex items-center justify-between w-full py-4 text-lg font-medium touch-manipulation"
                    type="button"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Things To Do
                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", mobileExpandedMenu === "activities" && "rotate-180")} />
                  </button>
                  {mobileExpandedMenu === "activities" && (
                    <div className="pb-4 space-y-1 animate-in slide-in-from-top-2">
                      {thingsToDoLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="block py-2.5 px-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors touch-manipulation"
                          onClick={() => {
                            console.log('Activity link clicked:', link.href);
                            setIsMobileMenuOpen(false);
                          }}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accommodation */}
                <div className="border-b border-border/40">
                  <button
                    onClick={() => {
                      console.log('Stays menu clicked');
                      toggleMobileSubMenu("stays");
                    }}
                    className="flex items-center justify-between w-full py-4 text-lg font-medium touch-manipulation"
                    type="button"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Accommodation
                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", mobileExpandedMenu === "stays" && "rotate-180")} />
                  </button>
                  {mobileExpandedMenu === "stays" && (
                    <div className="pb-4 space-y-1 animate-in slide-in-from-top-2">
                      {accommodationLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="block py-2.5 px-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors touch-manipulation"
                          onClick={() => {
                            console.log('Stay link clicked:', link.href);
                            setIsMobileMenuOpen(false);
                          }}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Eat & Drink */}
                <div className="border-b border-border/40">
                  <button
                    onClick={() => {
                      console.log('Dining menu clicked');
                      toggleMobileSubMenu("dining");
                    }}
                    className="flex items-center justify-between w-full py-4 text-lg font-medium touch-manipulation"
                    type="button"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Eat & Drink
                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", mobileExpandedMenu === "dining" && "rotate-180")} />
                  </button>
                  {mobileExpandedMenu === "dining" && (
                    <div className="pb-4 space-y-1 animate-in slide-in-from-top-2">
                      {eatDrinkLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="block py-2.5 px-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors touch-manipulation"
                          onClick={() => {
                            console.log('Dining link clicked:', link.href);
                            setIsMobileMenuOpen(false);
                          }}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Inspiration */}
                <div className="border-b border-border/40">
                  <button
                    onClick={() => {
                      console.log('Inspiration menu clicked');
                      toggleMobileSubMenu("inspiration");
                    }}
                    className="flex items-center justify-between w-full py-4 text-lg font-medium touch-manipulation"
                    type="button"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Inspiration
                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", mobileExpandedMenu === "inspiration" && "rotate-180")} />
                  </button>
                  {mobileExpandedMenu === "inspiration" && (
                    <div className="pb-4 space-y-1 animate-in slide-in-from-top-2">
                      {inspirationLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="block py-2.5 px-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors touch-manipulation"
                          onClick={() => {
                            console.log('Inspiration link clicked:', link.href);
                            setIsMobileMenuOpen(false);
                          }}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Actions */}
                <div className="pt-6 space-y-4">
                  <Button
                    className="w-full justify-center touch-manipulation"
                    onClick={() => {
                      console.log('User button clicked');
                      handleUserClick();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="default"
                    type="button"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {isAuthenticated ? "My Account" : "Sign In / Register"}
                  </Button>
                  <Link
                    href="/explore-map"
                    onClick={() => {
                      console.log('Explore map clicked');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 border rounded-md text-sm font-medium hover:bg-muted transition-colors touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Map className="h-4 w-4" />
                    Explore Map
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
