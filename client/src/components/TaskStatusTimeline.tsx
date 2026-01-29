import { motion } from 'framer-motion';
import { TaskStatus } from '../types';

interface TaskStatusTimelineProps {
  status: TaskStatus;
}

export default function TaskStatusTimeline({ status }: TaskStatusTimelineProps) {
  const statusConfig = {
    IN_PROGRESS: {
      color: 'blue',
      label: 'In Progress',
      icon: '🔄',
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-800',
      borderClass: 'border-blue-300',
    },
    SUBMITTED: {
      color: 'purple',
      label: 'Submitted',
      icon: '📤',
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-800',
      borderClass: 'border-purple-300',
    },
    COMPLETED: {
      color: 'green',
      label: 'Completed',
      icon: '✅',
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      borderClass: 'border-green-300',
    },
    REJECTED: {
      color: 'red',
      label: 'Rejected',
      icon: '❌',
      bgClass: 'bg-red-100',
      textClass: 'text-red-800',
      borderClass: 'border-red-300',
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${config.bgClass} ${config.borderClass}`}
    >
      <motion.span
        initial={{ rotate: 0 }}
        animate={{ rotate: status === 'IN_PROGRESS' ? [0, 10, -10, 0] : 0 }}
        transition={{
          duration: 2,
          repeat: status === 'IN_PROGRESS' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="text-xl"
      >
        {config.icon}
      </motion.span>
      <span className={`font-semibold ${config.textClass}`}>{config.label}</span>

      {/* Progress indicator for IN_PROGRESS */}
      {status === 'IN_PROGRESS' && (
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-2 h-2 rounded-full bg-blue-600"
        />
      )}
    </motion.div>
  );
}
