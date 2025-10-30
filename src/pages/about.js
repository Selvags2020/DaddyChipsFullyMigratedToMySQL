import Head from 'next/head';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <>
      <Head>
        <title>About Us | Daddy Chip</title>
        <meta name="description" content="Learn more about Daddy Chips, our mission, and our team." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-800 mb-6">
              Our <span className="text-amber-600">Story</span>
            </h1>
            <p className="text-lg md:text-xl text-amber-900/80 max-w-3xl mx-auto leading-relaxed">
              Crafting exceptional experiences since 2025. Discover what makes Daddy Chips different.
            </p>
          </motion.div>

          {/* Content Sections */}
          <div className="space-y-10">
            {/* Mission Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-10 bg-amber-500 rounded-full mr-4"></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-amber-800">Our Mission</h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  At <span className="font-semibold text-amber-600">Daddy Chips</span>, we're driven by a simple purpose: to deliver 
                  <span className="text-amber-600 font-medium"> exceptional quality</span>, 
                  <span className="text-amber-600 font-medium"> unbeatable value</span>, and 
                  <span className="text-amber-600 font-medium"> seamless experiences</span>. 
                  We carefully curate every product to ensure it meets our high standards.
                </p>
              </div>
            </motion.div>

            {/* Story Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-10 bg-amber-500 rounded-full mr-4"></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-amber-800">Our Journey</h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Founded in <span className="font-semibold text-amber-600">2025</span>, Daddy Chips began as a small team with a big vision. 
                  What started as a passion project has grown into a trusted brand serving thousands of satisfied customers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-amber-50/50 p-6 rounded-lg border border-amber-100">
                    <h3 className="font-bold text-amber-700 mb-2">2025</h3>
                    <p className="text-gray-700">Founded with just 3 team members and a single product line</p>
                  </div>
                  <div className="bg-amber-50/50 p-6 rounded-lg border border-amber-100">
                    <h3 className="font-bold text-amber-700 mb-2">Today</h3>
                    <p className="text-gray-700">Serving customers nationwide with 50+ premium products</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Team Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-10 bg-amber-500 rounded-full mr-4"></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-amber-800">Our Team</h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                  Our diverse team of passionate professionals brings together decades of combined experience in product curation, customer service, and e-commerce innovation.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Product Experts', 'Tech Wizards', 'Customer Champions', 'Logistics Pros'].map((team, index) => (
                    <div key={index} className="bg-amber-50/50 p-4 rounded-lg text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        {index + 1}
                      </div>
                      <h3 className="font-medium text-amber-800">{team}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <h3 className="text-2xl font-bold text-amber-800 mb-4">Join Our Story</h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                We're always looking for passionate individuals to join our growing family.
              </p>
              <button className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg">
                Contact Us
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}