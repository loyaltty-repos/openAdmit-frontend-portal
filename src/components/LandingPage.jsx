import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Globe,
  FileText,
  ClipboardList,
  BarChart,
  Server,
  Cpu,
  Brain,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getServerHealth } from '@/services/api.services';
import Navbar from '@/components/NavBar';
import Hero from '@/components/Hero';
import { Spotlight } from '@/components/ui/spotlight';
import Loader from '@/components/ui/loader';

export default function GoupbroadLandingPage() {
  const [serverStatus, setServerStatus] = useState({
    application: {
      environment: 'development',
      uptime: 'loading...',
      memoryUsage: {
        heapTotal: 'loading...',
        heapUsed: 'loading...'
      }
    },
    system: {
      cpuUsage: [0, 0, 0],
      totalMemory: '1',
      freeMemory: '1'
    },
    timestamp: Date.now()
  });

  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 6000);
  }, []);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await getServerHealth();
        console.log(response.data);

        if (response?.success) {
          setServerStatus(response.data);
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        console.error('Failed to fetch server status:', error);
        setIsOnline(false);
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const memoryPercent = ((1 - parseFloat(serverStatus.system.freeMemory) / parseFloat(serverStatus.system.totalMemory)) * 100).toFixed(1);

  return (
    <>
      {
        isLoading ? (
          <Loader />
        ) : (<>
          <Spotlight className="-top-20 md:block bottom-3 md:left-60 md:-top-20 opacity-90" fill="#145044" />
          <Spotlight className="-top-20 md:block bottom-3 md:left-60 md:-top-20 opacity-90" fill="#145044" />
          <div className="min-h-screen bg-gradient-to-b from-primary-1/10 to-white">
            <Navbar status={isOnline} />
            <Hero />

            <section id="features" className="py-20">
              <div className="container mx-auto px-4">
                <motion.h2
                  className="text-4xl font-extrabold text-gray-900 dark:text-white mb-12 text-center tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Streamline Your Study Abroad Journey
                </motion.h2>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <FeatureCard icon={<Globe className="h-10 w-10 text-primary-1" />} title="Dream College Management" variants={fadeIn} />
                  <FeatureCard icon={<FileText className="h-10 w-10 text-primary-1" />} title="Document Assistance" variants={fadeIn} />
                  <FeatureCard icon={<ClipboardList className="h-10 w-10 text-primary-1" />} title="Form Filling Support" variants={fadeIn} />
                  <FeatureCard icon={<BarChart className="h-10 w-10 text-primary-1" />} title="Status Management" variants={fadeIn} />
                </motion.div>
              </div>
            </section>

            <section id="server-status" className="py-16 bg-primary-1/10">
              <div className="container mx-auto px-4">
                <motion.h2
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  System Health & Performance
                </motion.h2>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <ServerMetricCard
                    icon={<Server className="h-10 w-10 text-primary-1" />}
                    title="Server Status"
                    value={isOnline ? 'Online' : 'Offline'}
                    status={isOnline ? 'good' : 'critical'}
                    variants={fadeIn}
                  />
                  <ServerMetricCard
                    icon={<Cpu className="h-10 w-10 text-primary-1" />}
                    title="CPU Load"
                    value={`${(serverStatus.system.cpuUsage[0] * 100).toFixed(1)}%`}
                    status={serverStatus.system.cpuUsage[0] < 0.7 ? 'good' : serverStatus.system.cpuUsage[0] < 0.9 ? 'warning' : 'critical'}
                    variants={fadeIn}
                  />
                  <ServerMetricCard
                    icon={<Brain className="h-10 w-10 text-primary-1" />}
                    title="Memory Usage"
                    value={`${memoryPercent}%`}
                    status={memoryPercent < 70 ? 'good' : memoryPercent < 90 ? 'warning' : 'critical'}
                    variants={fadeIn}
                  />
                  <ServerMetricCard
                    icon={<Clock className="h-10 w-10 text-primary-1" />}
                    title="Uptime"
                    value={serverStatus.application.uptime}
                    status="info"
                    variants={fadeIn}
                  />
                </motion.div>

                <motion.div
                  className="mt-8 text-center text-sm text-gray-500 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Last updated: {new Date(serverStatus.timestamp).toLocaleTimeString()}
                </motion.div>
              </div>
            </section>

            <motion.section className="bg-primary-1 py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}>
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Your Study Abroad Journey?</h2>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Button size="lg" className="bg-white text-primary-1 hover:bg-white/90 text-lg px-8">Sign Up Now</Button>
                </motion.div>
              </div>
            </motion.section>

            <section id="tech-stack" className="py-20">
              <div className="container mx-auto px-4">
                <motion.h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  Built with Modern Technology
                </motion.h2>
                <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto" variants={staggerContainer} initial="hidden" animate="visible">
                  <TechStackItem name="Node.js" variants={fadeIn} />
                  <TechStackItem name="React.js" variants={fadeIn} />
                  <TechStackItem name="MongoDB" variants={fadeIn} />
                  <TechStackItem name="Docker" variants={fadeIn} />
                  <TechStackItem name="ShadCN UI" variants={fadeIn} />
                  <TechStackItem name="Express" variants={fadeIn} />
                </motion.div>
              </div>
            </section>

            <footer className="bg-gray-900 text-gray-300 py-8">
              <div className="container mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Globe className="h-6 w-6 text-primary-1" />
                  <span className="text-xl font-bold text-white">Go Abroad</span>
                </div>
                <p className="text-gray-400">© {new Date().getFullYear()} Go Abroad. Maintained by Go Abroad.</p>
              </div>
            </footer>
          </div>
        </>)
      }
    </>
  );
}

function FeatureCard({ icon, title, variants }) {
  return (
    <motion.div variants={variants}>
      <Card className="h-full rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
        <CardHeader className="text-center space-y-4">
          <motion.div
            className="mx-auto p-4 rounded-full bg-primary-1/10 w-fit"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {icon}
          </motion.div>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">{title}</CardTitle>
        </CardHeader>
      </Card>
    </motion.div>
  );
}

function ServerMetricCard({ icon, title, value, status, variants }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-amber-500';
      case 'critical': return 'text-red-600';
      default: return 'text-primary-1';
    }
  };

  return (
    <motion.div variants={variants}>
      <Card className="h-full rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-col items-center space-y-3">
          <motion.div
            className="p-4 rounded-full bg-primary-1/10"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {icon}
          </motion.div>
          <CardTitle className="text-md text-gray-800 dark:text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <span className={`text-xl font-bold ${getStatusColor(status)}`}>{value}</span>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TechStackItem({ name, variants }) {
  return (
    <motion.div variants={variants}>
      <Card className="h-full rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
        <CardHeader className="text-center py-4 flex items-center justify-center">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-white">{name}</CardTitle>
        </CardHeader>
      </Card>
    </motion.div>
  );
}

FeatureCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  variants: PropTypes.object,
};

ServerMetricCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  variants: PropTypes.object,
};

TechStackItem.propTypes = {
  name: PropTypes.string.isRequired,
  variants: PropTypes.object,
};