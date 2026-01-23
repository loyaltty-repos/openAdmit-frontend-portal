import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TypewriterEffect from './ui/TypewriteEffect';
import { useState, useEffect } from 'react';
import { isAuthenticated, subscribeToAuth } from '@/lib/auth';

export const Hero = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {

        setIsLoggedIn(isAuthenticated());


        const unsubscribe = subscribeToAuth((authenticated) => {
            setIsLoggedIn(authenticated);
        });

        return () => unsubscribe();
    }, []);

    const primaryButtonText = isLoggedIn ? "Go to Dashboard" : "Get Started";
    const primaryButtonPath = isLoggedIn ? "/dashboard" : "/signup";

    return (
        <section
            id="hero"
            className="relative mt-6 pt-28 lg:pt-24 pb-20 overflow-hidden h-screen"
        >
            <div className="absolute inset-0 z-0">
                <img
                    src="grid.svg"
                    alt=""
                    className="w-full h-full object-cover dark:opacity-50 opacity-75"
                />
            </div>
            <div
                className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10"
                aria-hidden="true"
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center text-center max-w-4xl mx-auto mt-12 md:mt-16 lg:mt-20"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-primary-1/10 dark:bg-primary-1/20 border border-primary-1/20 mb-6"
                    >
                        <span className="text-xs font-semibold text-primary-1">
                            Introducing Goupbroad  -  Your Journey to Study Abroad Starts Here
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6"
                    >
                        <span className="block">Study Abroad. Simplified.</span>
                        <span className="inline-block">
                            <TypewriterEffect
                                className="mt-2"
                                words={[
                                    'College Shortlisting',
                                    'SOP & LOR Writing',
                                    'Document Automation',
                                    'Application Tracking'
                                ]}
                            />
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-lg mt-1 md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl"
                    >
                        A comprehensive platform that simplifies the entire process from college shortlisting to application tracking.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 mt-16"
                    >
                        <Link
                            to={primaryButtonPath}
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-1 transition-colors shadow-md hover:shadow-lg"
                        >
                            {primaryButtonText}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>

                        <Link
                            to="#how-it-works"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300  text-base font-medium rounded-md text-gray-900 dark:text-white bg-white  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            How It Works
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
