'use client';

import {
  CircleUserRound,
  GraduationCap,
  FileInput,
  CheckCircle2,
} from 'lucide-react';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const steps = [
  {
    id: '01',
    title: 'Create Your Profile',
    description:
      'Sign up and tell us about your academic background, goals, and preferences. This helps us understand your journey better.',
    icon: CircleUserRound,
  },
  {
    id: '02',
    title: 'Get Matched with a Counselor',
    description:
      'Our expert counselors analyze your profile and suggest best-fit universities tailored to your ambitions.',
    icon: GraduationCap,
  },
  {
    id: '03',
    title: 'Complete Questionnaires & Tasks',
    description:
      'Answer personalized questions and complete tasks like uploading documents, essays, and test scores as guided by your counselor.',
    icon: FileInput,
  },
  {
    id: '04',
    title: 'Submit Applications with Confidence',
    description:
      'After counselor review and feedback, submit your polished application to the universities of your choice.',
    icon: CheckCircle2,
  },
];

export const HowItWorks = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const timelineLineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const stepRef = useRef(null);
  const isInView = useInView(stepRef, { once: true });
  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      <div
        ref={containerRef}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-1/10 border border-primary-1/20 mb-6">
            <span className="text-xs font-semibold text-primary-1">
              Simple Process, Big Dreams
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            How Goupbroad Works
          </h2>
          <p className="text-lg text-gray-600">
            From research to takeoff, Goupbroad simplifies your study abroad journey with expert support at every step.
          </p>
        </div>

        <div className="relative">
          {/* Scroll-animated vertical line */}
          <motion.div
            className="absolute left-1/2 top-0 w-0.5 bg-gradient-to-b from-primary-1 to-primary-1/20 hidden md:block origin-top"
            style={{ height: timelineLineHeight }}
          />

          <div className="space-y-16 relative">
            {steps.map((step, index) => {


              return (
                <motion.div
                  ref={stepRef}
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative md:grid md:grid-cols-2 md:gap-12 md:items-center"
                >
                  <div
                    className={`md:col-span-1 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'
                      }`}
                  >
                    <div className="md:pr-8 md:pl-0 px-4">
                      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative z-10">
                        <div className="absolute -inset-px bg-gradient-to-br from-primary-1 via-primary-1/20 to-white opacity-5 blur-sm rounded-2xl" />
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-1 text-white">
                            <step.icon size={24} />
                          </div>
                          <span className="text-4xl font-bold text-gray-300">
                            {step.id}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">
                          {step.title}
                        </h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Round pulse marker on line */}
                  <div className="hidden md:col-span-1 md:flex md:justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary-1 flex items-center justify-center border-4 border-white text-white relative z-10 animate-pulse-slow">
                      <span className="text-xl font-bold">{step.id}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
