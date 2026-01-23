
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

const statusColors = {
  good: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  critical: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};


export default function ServerMetricCard({ icon, title, value, status, variants }) {
  return (
    <motion.div
      className="rounded-2xl shadow-md p-6 bg-white dark:bg-gray-900 flex flex-col items-center justify-center text-center"
      variants={variants}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      <span
        className={cn(
          'mt-2 px-3 py-1 rounded-full text-xs font-medium',
          statusColors[status]
        )}
      >
        {status.toUpperCase()}
      </span>
      </motion.div>
  );
}

ServerMetricCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  status: PropTypes.oneOf(['good', 'warning', 'critical', 'info']).isRequired,
  variants: PropTypes.object,
};
