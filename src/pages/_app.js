import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Layout from '../components/Layout';
import Navbar from '@/components/Navbar';
import '../styles/globals.css';

 

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-amber-600 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="EvenMoreFoods - Online food marketplace" />
        <meta name="theme-color" content="#0c6bdb" />
        <meta name="mobile-web-app-capable" content="yes"></meta>
<meta name="apple-mobile-web-app-capable" content="yes"></meta>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"></meta>
        
        {/* For Apple devices */}
       
      </Head>
      
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CartProvider>
      </AuthProvider>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          duration: 3000,
        }}
      />
    </>
  );
}

export default MyApp;