import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';

import MainFeature from '../components/MainFeature';
import getIcon from '../utils/iconUtils';
import { AuthContext } from '../App';
import { getCalculatorSettings, saveCalculatorSettings } from '../services/calculatorSettingsService';
  const dispatch = useDispatch();
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);

const Home = ({ darkMode }) => {
  const LogOutIcon = getIcon('LogOut');

  const [loading, setLoading] = useState(true);

  // Load user settings from database
  useEffect(() => {
    if (user) {
      const loadSettings = async () => {
        try {
          setLoading(true);
          const settings = await getCalculatorSettings(user.userId);
          if (settings) {
            // We pass darkMode directly to the parent component through props
          }
        } catch (error) {
          toast.error("Failed to load user settings");
        } finally {
          setLoading(false);
        }
      };
      loadSettings();
    }
  }, [user, dispatch]);

  const CalculatorIcon = getIcon('Calculator');
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-surface-800 shadow-sm border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <CalculatorIcon className="w-7 h-7 text-primary dark:text-primary-light" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Icalci
            </h1>
          </motion.div>
          
          <nav>
            {user && (
              <div className="flex items-center gap-4">
                <span className="hidden md:block text-sm text-surface-600 dark:text-surface-400">
                  Hello, {user.firstName || user.emailAddress.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOutIcon className="w-5 h-5" />
                </button>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  aria-label="GitHub"
              aria-label="GitHub"
            >
              <GitHubIcon className="w-5 h-5" />
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 lg:py-12">
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
              Your Smart Calculator Tool
            </h2>
            <p className="text-surface-600 dark:text-surface-400 text-center max-w-2xl mx-auto mb-8">
              Perform calculations quickly and accurately with our intuitive calculator that also keeps track of your calculation history.
            </p>
          </motion.div>
          
          {loading ? (
            <div className="text-center p-8">Loading calculator...</div>
          ) : <MainFeature />}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-100 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-surface-600 dark:text-surface-400 text-sm">
            © {new Date().getFullYear()} Icalci. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;