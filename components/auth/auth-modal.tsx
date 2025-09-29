"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './auth-provider';

export function AuthModal() {
  const { isAuthenticated, login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when modal opens
    if (!isAuthenticated && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Small delay for better UX
    setTimeout(() => {
      const success = login(password);
      if (!success) {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white dark:bg-zinc-900 rounded-lg p-8 w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-700"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Welcome to Dataset Finder
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Please enter the password to continue. Ask{" "}
                <a 
                  href="https://digital-science.slack.com/archives/D06LBJ7R7FC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Kristian
                </a>{" "}
                for it if you dont have it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-md px-4 py-3 outline-none text-zinc-800 dark:text-zinc-300 border border-transparent focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white rounded-md px-4 py-3 font-medium transition-colors disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Authenticating...
                  </div>
                ) : (
                  'Continue'
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hint: Try &ldquo;demo123&rdquo; if you don&apos;t have the password
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}