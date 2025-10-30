import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you can add logic to send the form data to your backend or email service
  };

  return (
    <>
      <Head>
        <title>Home Us | Daddy Chips</title>
        <meta name="description" content="Home - Bussiness Name." />
      </Head>
      <div className="container mx-auto px-4 py-10">
        
      </div>
    </>
  );
}
