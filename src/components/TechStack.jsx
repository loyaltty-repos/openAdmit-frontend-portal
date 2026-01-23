// components/TechStack.tsx

import { motion } from 'framer-motion';

const techs = [
  { name: 'Node.js',    icon: '/tech/nodejs.svg' },
  { name: 'React.js', icon: '/tech/react.svg' },
  { name: 'MongoDB', icon: '/tech/mongodb.svg' },
  { name: 'Docker', icon: '/tech/docker.svg' },
  { name: 'ShadCN UI', icon: '/tech/shadcn.svg' },
  { name: 'Express', icon: 'https://www.manektech.com/storage/developer/1646733543.webp' },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const TechStack = () => {
  return (
    <section id="tech-stack" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-gray-900 text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Built with Modern Technology
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-10 max-w-5xl mx-auto">
          {techs.map((tech, index) => (
            <motion.div
              key={tech.name}
              className="flex flex-col items-center text-center"
              custom={index}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="w-16 h-16 relative mb-3 rounded-md p-4 shadow-md flex items-center justify-center">
              <img
                  src={tech.icon}
                  alt={tech.name}
                  className="object-contain"
                />
              </div>
              <span className="text-base font-medium text-gray-700">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
