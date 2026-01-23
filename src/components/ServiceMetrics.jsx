
import { motion } from 'framer-motion';
import { Server, Cpu, Brain, Clock } from 'lucide-react';
import ServerMetricCard from './ServerMetricCard';
import PropTypes from 'prop-types';


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const ServerMetrics = ({ serverStatus, isOnline }) => {
    const total = parseFloat(serverStatus.system.totalMemory);
    const free = parseFloat(serverStatus.system.freeMemory);
    const used = total - free;
    const memoryPercent = Math.round((used / total) * 100);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
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
            status={
              serverStatus.system.cpuUsage[0] < 0.7
                ? 'good'
                : serverStatus.system.cpuUsage[0] < 0.9
                ? 'warning'
                : 'critical'
            }
            variants={fadeIn}
          />
          <ServerMetricCard
            icon={<Brain className="h-10 w-10 text-primary-1" />}
            title="Memory Usage"
            value={`${memoryPercent}%`}
            status={
              memoryPercent < 70
                ? 'good'
                : memoryPercent < 90
                ? 'warning'
                : 'critical'
            }
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
  );
};
ServerMetrics.propTypes = {
  serverStatus: PropTypes.shape({
    system: PropTypes.shape({
      memoryUsed: PropTypes.number.isRequired,
      totalMemory: PropTypes.number.isRequired,
      cpuUsage: PropTypes.arrayOf(PropTypes.number).isRequired,
      freeMemory: PropTypes.number.isRequired,
    }).isRequired,
    application: PropTypes.shape({
      uptime: PropTypes.string.isRequired,
    }).isRequired,
    timestamp: PropTypes.number.isRequired,
  }).isRequired,
  isOnline: PropTypes.bool.isRequired,
};

export default ServerMetrics;
