// ThanksForApplying.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const ThanksForApplying = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 space-y-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            Application Submitted!
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Thank you for your interest in joining our team. We've received your application and will carefully review it.
          </p>
          <div className="text-sm text-gray-500">
            You'll be automatically redirected to the home page in 10 seconds
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>We'll be in touch soon</span>
          </div>
          
          <button
            onClick={goHome}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg 
                     hover:from-blue-700 hover:to-blue-800 transition-all duration-200 
                     shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Return to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThanksForApplying;
