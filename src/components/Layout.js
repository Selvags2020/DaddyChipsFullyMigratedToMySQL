import Link from 'next/link';
import { useState } from 'react';

export default function Layout({ children }) {
  const [showPopup, setShowPopup] = useState(false);

  const handleDeveloperClick = (e) => {
    e.preventDefault();
    
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Open dial pad on mobile
      window.location.href = `tel:8148462484`;
    } else {
      // Show popup on desktop
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 pb-4">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-2 text-xs">
          <div className="container mx-auto px-4">
            <div className="flex flex-row justify-center items-center gap-4">
              <p className="text-gray-400">© {new Date().getFullYear()} Daddy Chips</p>
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link>
              <a 
                href="#" 
                onClick={handleDeveloperClick}
                className="text-gray-400 hover:text-white"
              >
                Website Created by RSoftTech
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Popup for non-mobile devices */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Developer</h3>
            <p className="text-gray-600 mb-4">
              Need a similar website or technical support? Contact:
            </p>
            <p className="text-gray-800 font-medium">Call or WhatsApp: +918148462484</p>
            <button
              onClick={closePopup}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}