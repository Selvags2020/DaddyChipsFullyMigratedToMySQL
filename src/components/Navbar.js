import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useContext, useState, useRef, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const { currentUser, logout } = useAuth(); // This must always be called
  const { cartCount } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && !event.target.closest('.search-container') && window.innerWidth > 768) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const navLinks = [
    { href: '/products/all', text: 'All Products' },
    // { href: '/Payment', text: 'Payment' },
    { href: '/about', text: 'About Us' },
    { href: '/contact', text: 'Contact' },
    ...(currentUser?.role === 'Admin' ? [{ href: '/admin/AdminDashboard', text: 'Admin Dashboard' }] : []),
    // { href: 'https://rsofttech.vercel.app', text: 'Contact Developer' }
  ];

  const logoUrl = 'https://res.cloudinary.com/djqkpu1rf/image/upload/w_180,c_scale/v1751975046/ecom_products/aanava_logo_f2ggau.jpg';
  const isAllProductsPage = router.pathname === '/products/all';

  return (
    <nav className="bg-[#0c6bdb] shadow-lg sticky top-0 z-50 overflow-x-hidden">

      <div className="container mx-auto px-2 md:px-4">
        {/* Mobile search bar */}
        {isSearchOpen && (
          <div className="md:hidden flex items-center px-4 py-3 bg-[#58a33a] w-full">
            <button onClick={toggleSearch} className="p-2 text-white mr-2" aria-label="Close search">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            {/* <form onSubmit={handleSearch} className="flex-1 flex search-container">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="py-2 px-4 rounded-l-full focus:outline-none text-gray-800 w-full"
              />
              <button type="submit" className="bg-white px-4 rounded-r-full text-emerald-600" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form> */}
          </div>
        )}

        {/* Desktop & mobile nav bar */}
        <div className={`${isSearchOpen ? 'hidden md:flex' : 'flex'} justify-between items-center h-16 md:h-20`}>
          {/* Logo */}
          <Link href="/" className="flex items-center h-full py-2 min-w-0">
            <div className="relative h-full w-28 md:w-40">
              <Image
                src='/images/logo.png'
                alt="UM Logo"
                width={160}
                height={64}
                className="object-contain object-left"
                priority
                style={{ maxHeight: '100%', width: 'auto' }}
              />
            </div>
            <span className="ml-2 flex flex-col leading-tight text-white w-full">
              <span className="text-2xl md:text-4xl font-extrabold tracking-wide drop-shadow-lg">
                Daddy
              </span>
              <span className="text-lg md:text-2xl font-bold drop-shadow-md skew-x-[-10deg]">
                Chips
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  router.pathname === link.href
                    ? 'bg-white/20 text-white font-semibold shadow-inner'
                    : 'text-white/90 hover:bg-white/10 hover:text-white hover:shadow-md'
                }`}
              >
                {link.text}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-3">
           

           

            {/* Cart icon */}
            {!isSearchOpen && (
              <Link href="/cart" className="relative p-2 text-white hover:text-amber-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-emerald-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Admin Sign Out */}
            {!isSearchOpen && currentUser?.role === 'Admin' && (
              <button
                onClick={handleSignOut}
                className="hidden md:block px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-900 rounded-md text-sm font-medium hover:from-amber-500 hover:to-amber-600 shadow-lg"
              >
                Sign Out
              </button>
            )}

            {/* Mobile menu button */}
            {!isSearchOpen && (
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 text-white hover:text-amber-300"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMenuOpen && !isSearchOpen ? 'block' : 'hidden'} bg-[#0c6bdb] shadow-xl`}>
          <div className="px-2 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  router.pathname === link.href
                    ? 'bg-white/20 text-white shadow-inner'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.text}
              </Link>
            ))}
            {currentUser?.role === 'Admin' && (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-3 rounded-md text-base font-medium bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-900 hover:from-amber-500 hover:to-amber-600 shadow-lg"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}