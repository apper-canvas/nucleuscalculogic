import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

const MainFeature = () => {
  // Icons
  const TrashIcon = getIcon('Trash2');
  const RotateCcwIcon = getIcon('RotateCcw');
  const ClockIcon = getIcon('Clock');
  const XIcon = getIcon('X');
  const HistoryIcon = getIcon('History');

  // States
  const [displayValue, setDisplayValue] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('calcHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('calcHistory', JSON.stringify(history));
  }, [history]);

  const clearDisplay = () => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    toast.info("Calculator cleared");
  };

  const clearEntry = () => {
    setDisplayValue('0');
    setWaitingForOperand(false);
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success("History cleared");
  };

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplayValue(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? String(digit) : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
    } else if (displayValue.indexOf('.') === -1) {
      setDisplayValue(displayValue + '.');
    }
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(displayValue);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculateOperation(currentValue, inputValue, operation);
      
      setPreviousValue(newValue);
      setDisplayValue(String(newValue));
      
      // Add to history when chaining operations
      const calculation = `${currentValue} ${operation} ${inputValue} = ${newValue}`;
      addToHistory(calculation, newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperator);
  };

  const calculateOperation = (firstValue, secondValue, operator) => {
    switch (operator) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    if (!operation || previousValue === null) return;
    
    const inputValue = parseFloat(displayValue);
    const result = calculateOperation(previousValue, inputValue, operation);
    
    // Format for displaying in history
    const calculation = `${previousValue} ${operation} ${inputValue} = ${result}`;
    
    setDisplayValue(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
    
    addToHistory(calculation, result);
  };

  const addToHistory = (calculation, result) => {
    const newEntry = {
      calculation,
      result: String(result),
      timestamp: new Date().toISOString()
    };
    
    setHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep only 10 most recent entries
  };

  const toggleHistoryPanel = () => {
    setShowHistory(prev => !prev);
  };

  const recallFromHistory = (entry) => {
    setDisplayValue(entry.result);
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
    toast.info("Value recalled from history");
  };

  const formatDisplayValue = (value) => {
    // Handle potential decimal formatting for clarity
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    // Use fixed decimal places only if needed
    return String(numValue).length > 10 ? numValue.toPrecision(10) : value;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative grid grid-cols-1 md:grid-cols-5 gap-6 rounded-2xl overflow-hidden"
      >
        {/* Main Calculator */}
        <div className="md:col-span-3 bg-white dark:bg-surface-900 rounded-2xl shadow-soft dark:shadow-neu-dark p-6 border border-surface-200 dark:border-surface-700">
          {/* Display */}
          <div className="calculator-display mb-6">
            <div className="text-sm text-surface-500 dark:text-surface-400 mb-1 min-h-[20px]">
              {previousValue !== null ? `${previousValue} ${operation}` : ''}
            </div>
            <div className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white overflow-x-auto whitespace-nowrap scrollbar-hide">
              {formatDisplayValue(displayValue)}
            </div>
          </div>
          
          {/* Keypad */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <button 
              onClick={clearDisplay} 
              className="calculator-button calculator-clear"
            >
              AC
            </button>
            <button 
              onClick={clearEntry} 
              className="calculator-button calculator-action"
            >
              CE
            </button>
            <button 
              onClick={() => performOperation('÷')} 
              className="calculator-button calculator-operator"
            >
              ÷
            </button>
            <button 
              onClick={() => performOperation('×')} 
              className="calculator-button calculator-operator"
            >
              ×
            </button>
            
            {/* Row 2 */}
            <button 
              onClick={() => inputDigit(7)} 
              className="calculator-button calculator-number"
            >
              7
            </button>
            <button 
              onClick={() => inputDigit(8)} 
              className="calculator-button calculator-number"
            >
              8
            </button>
            <button 
              onClick={() => inputDigit(9)} 
              className="calculator-button calculator-number"
            >
              9
            </button>
            <button 
              onClick={() => performOperation('-')} 
              className="calculator-button calculator-operator"
            >
              -
            </button>
            
            {/* Row 3 */}
            <button 
              onClick={() => inputDigit(4)} 
              className="calculator-button calculator-number"
            >
              4
            </button>
            <button 
              onClick={() => inputDigit(5)} 
              className="calculator-button calculator-number"
            >
              5
            </button>
            <button 
              onClick={() => inputDigit(6)} 
              className="calculator-button calculator-number"
            >
              6
            </button>
            <button 
              onClick={() => performOperation('+')} 
              className="calculator-button calculator-operator"
            >
              +
            </button>
            
            {/* Row 4 */}
            <button 
              onClick={() => inputDigit(1)} 
              className="calculator-button calculator-number"
            >
              1
            </button>
            <button 
              onClick={() => inputDigit(2)} 
              className="calculator-button calculator-number"
            >
              2
            </button>
            <button 
              onClick={() => inputDigit(3)} 
              className="calculator-button calculator-number"
            >
              3
            </button>
            <button 
              onClick={handleEquals} 
              className="calculator-button calculator-equals row-span-2"
            >
              =
            </button>
            
            {/* Row 5 */}
            <button 
              onClick={() => inputDigit(0)} 
              className="calculator-button calculator-number col-span-2"
            >
              0
            </button>
            <button 
              onClick={inputDecimal} 
              className="calculator-button calculator-number"
            >
              .
            </button>
          </div>
          
          {/* History Toggle - Mobile Only */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleHistoryPanel}
            className="mt-6 md:hidden w-full flex items-center justify-center gap-2 text-primary dark:text-primary-light py-3 rounded-xl border border-surface-200 dark:border-surface-700"
          >
            {showHistory ? (
              <>
                <XIcon className="w-5 h-5" />
                <span>Hide History</span>
              </>
            ) : (
              <>
                <HistoryIcon className="w-5 h-5" />
                <span>Show History</span>
              </>
            )}
          </motion.button>
        </div>
        
        {/* History Panel - Mobile (conditionally shown) */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-surface-900 rounded-2xl shadow-soft dark:shadow-neu-dark p-6 overflow-hidden"
            >
              <HistoryPanel 
                history={history} 
                clearHistory={clearHistory} 
                recallFromHistory={recallFromHistory}
                TrashIcon={TrashIcon}
                ClockIcon={ClockIcon}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* History Panel - Desktop (always visible) */}
        <div className="hidden md:block md:col-span-2 bg-white dark:bg-surface-900 rounded-2xl shadow-soft dark:shadow-neu-dark p-6 border border-surface-200 dark:border-surface-700">
          <HistoryPanel 
            history={history} 
            clearHistory={clearHistory} 
            recallFromHistory={recallFromHistory}
            TrashIcon={TrashIcon}
            ClockIcon={ClockIcon}
          />
        </div>
      </motion.div>
    </div>
  );
};

// History Panel Component
const HistoryPanel = ({ history, clearHistory, recallFromHistory, TrashIcon, ClockIcon }) => {
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-primary dark:text-primary-light" />
          <span>History</span>
        </h3>
        
        {history.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={clearHistory}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
            aria-label="Clear history"
          >
            <TrashIcon className="w-5 h-5" />
          </motion.button>
        )}
      </div>
      
      <div className="h-[400px] overflow-y-auto pr-2 scrollbar-hide">
        {history.length === 0 ? (
          <div className="history-empty">
            <p>No calculations yet</p>
          </div>
        ) : (
          history.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="history-card"
              onClick={() => recallFromHistory(entry)}
            >
              <div className="text-sm text-surface-500 dark:text-surface-400 mb-1">
                {formatTime(entry.timestamp)}
              </div>
              <div className="text-surface-800 dark:text-surface-200">
                {entry.calculation}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </>
  );
};

export default MainFeature;