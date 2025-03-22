
import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 px-6 container mx-auto max-w-7xl">
        {/* Hero Section */}
        <motion.section 
          className="py-16 md:py-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-3xl mx-auto">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              About Wholesale System
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We connect discerning customers with premium products while providing wholesalers with powerful business tools.
            </motion.p>
          </div>
        </motion.section>
        
        {/* About Content */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1577401239170-897942555fb3?q=80&w=2000&auto=format&fit=crop" 
                alt="Our showroom" 
                className="w-full h-auto rounded-lg shadow-md"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-semibold">Our Story</h2>
              <p className="text-muted-foreground">
                Founded in 2010, Wholesale System began with a simple mission: to bridge the gap between manufacturers, wholesalers, and customers. We believe that quality products should be accessible to everyone, while providing powerful business tools for our wholesale partners.
              </p>
              <p className="text-muted-foreground">
                Our curated collection of home goods, kitchenware, and decor items are sourced from artisans and manufacturers who share our commitment to quality craftsmanship and sustainable practices.
              </p>
              <p className="text-muted-foreground">
                For our wholesale partners, we've developed a suite of tools to help streamline inventory management, customer relationships, and sales tracking.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="mb-20">
          <motion.h2 
            className="text-3xl font-semibold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Values
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white p-8 rounded-lg shadow-sm border text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-4">Quality</h3>
              <p className="text-muted-foreground">
                We never compromise on quality. Every product in our catalog undergoes rigorous testing and review.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-white p-8 rounded-lg shadow-sm border text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-4">Transparency</h3>
              <p className="text-muted-foreground">
                We believe in open communication with both our customers and wholesale partners.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-white p-8 rounded-lg shadow-sm border text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-4">Efficiency</h3>
              <p className="text-muted-foreground">
                Our systems are designed to save time and reduce complexity for our wholesale partners.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="mb-20">
          <motion.h2 
            className="text-3xl font-semibold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Team
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm border text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop" 
                  alt="Sarah Johnson" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-medium">Sarah Johnson</h3>
              <p className="text-sm text-muted-foreground mb-2">Founder & CEO</p>
            </motion.div>
            
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm border text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=500&auto=format&fit=crop" 
                  alt="Michael Chen" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-medium">Michael Chen</h3>
              <p className="text-sm text-muted-foreground mb-2">Product Director</p>
            </motion.div>
            
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm border text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop" 
                  alt="Emily Rodriguez" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-medium">Emily Rodriguez</h3>
              <p className="text-sm text-muted-foreground mb-2">Wholesale Relations</p>
            </motion.div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Wholesale System</h3>
              <p className="text-muted-foreground">
                Premium products for discerning customers and wholesale partners.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/wholesale" className="text-muted-foreground hover:text-primary transition-colors">
                    Wholesale
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Contact</h3>
              <p className="text-muted-foreground">
                123 Design Street<br />
                Creativity City, CO 12345<br />
                info@wholesalesystem.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Wholesale System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
