import { motion } from 'framer-motion';
import { ProjectStatus } from '../types';

interface LifecycleStepperProps {
  status: ProjectStatus;
}

export default function LifecycleStepper({ status }: LifecycleStepperProps) {
  const steps = [
    { key: 'OPEN', label: 'Open', description: 'Awaiting solver selection' },
    { key: 'ASSIGNED', label: 'Assigned', description: 'Solver working on project' },
  ];

  const currentIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Project Lifecycle</h2>
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div key={step.key} className="flex-1 relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-1 bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                      className="h-full bg-green-500"
                    />
                  </div>
                )}

                {/* Step Circle */}
                <div className="relative flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isCompleted
                        ? '#10b981'
                        : isActive
                        ? '#3b82f6'
                        : '#e5e7eb',
                    }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-10"
                  >
                    {isCompleted ? (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    ) : (
                      <span className="text-white font-bold">{index + 1}</span>
                    )}
                  </motion.div>

                  {/* Step Label */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-center"
                  >
                    <p
                      className={`font-semibold ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  </motion.div>

                  {/* Active Pulse Animation */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute top-0 w-12 h-12 rounded-full bg-blue-400"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
