
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, ShoppingCart, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/MainLayout";
import { serviceCategories } from "@/lib/mockData";

const Home: React.FC = () => {
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="space-y-12"
      >
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                Your One-Stop Shop for Digital Services
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Get instant access to streaming services, game recharges, social media boosts, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/services">
                  <Button size="lg" className="w-full sm:w-auto">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Browse Services
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Play className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000&auto=format&fit=crop" 
                alt="Digital Services" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our wide range of digital services designed to make your online experience better.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((category) => (
              <Link to={`/services?category=${category.id}`} key={category.id}>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                  <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                    {category.icon === "play-circle" && <Play className="h-6 w-6 text-primary" />}
                    {category.icon === "gamepad-2" && <Zap className="h-6 w-6 text-primary" />}
                    {category.icon === "thumbs-up" && <Shield className="h-6 w-6 text-primary" />}
                    {category.icon === "shopping-cart" && <ShoppingCart className="h-6 w-6 text-primary" />}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                    {category.description}
                  </p>
                  <div className="text-primary font-medium flex items-center">
                    Browse Services
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Servexlb?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide the best digital services with instant delivery and excellent support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
              <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Instant Delivery
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get your services delivered instantly after purchase. No waiting needed.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
              <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Wide Selection
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose from a wide range of digital services to meet all your needs.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
              <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our dedicated support team is always ready to assist you with any issues.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="bg-primary rounded-xl p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-primary-foreground mb-6">
                  Create an account today and get access to all our premium digital services.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Sign Up Now
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/20 w-full sm:w-auto">
                    Browse Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </MainLayout>
  );
};

export default Home;
