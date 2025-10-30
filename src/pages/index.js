import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CartContext } from './_app';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { getDatabase, ref, get } from '../lib/firebase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/products/all');
  }, [router]); // Added router to dependency array

  return null; // No rendering needed
}