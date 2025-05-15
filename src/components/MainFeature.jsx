import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { setDarkMode, setScientificMode } from '../store/calculatorSlice';
import * as math from 'mathjs';
import getIcon from '../utils/iconUtils';

const MainFeature = () => {
  // Icons
  const TrashIcon = getIcon('Trash2');
  const RotateCcwIcon = getIcon('RotateCcw');
  const Calculator = getIcon('Calculator');
  const Functions = getIcon('Function');
  const ClockIcon = getIcon('Clock');
  const XIcon = getIcon('X');
  const HistoryIcon = getIcon('History');
  const PiIcon = getIcon('CircleDot');
  const Sigma = getIcon('Sigma');
  const PercentIcon = getIcon('Percent');
  const PowerIcon = getIcon('Zap');
  const SquareRootIcon = getIcon('Square');

  // States
  const [displayValue, setDisplayValue] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState([]); 
  const [showHistory, setShowHistory] = useState(false);
  const [scientificMode, setScientificMode] = useState(false);
  const [memoryValue, setMemoryValue] = useState(0);
  const [degrees, setDegrees] = useState(true); // true for degrees, false for radians
  const [shiftMode, setShiftMode] = useState(false); // for inverse trig functions
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Redux
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  
  // Import needed services
  const { 
    getCalculationHistory, 
    saveCalculation, 
    clearCalculationHistory 
  } = require('../services/calculationHistoryService');
  
  const { 
    getMemoryValue, 
    saveMemoryValue 
  } = require('../services/memoryValueService');
  
  const {
    getCalculatorSettings,
    saveCalculatorSettings
  } = require('../services/calculatorSettingsService');

  useEffect(() => {
    if (user) {
      loadCalculatorData();
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('calcHistory', JSON.stringify(history));
  }, [history]);
  
  // Load calculator data from the database
  const loadCalculatorData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load calculator settings
      const settings = await getCalculatorSettings(user.userId);
      if (settings) {
        setScientificMode(settings.scientificMode);
        setDegrees(settings.angleMode === 'degrees');
        dispatch(setDarkMode(settings.darkMode));
        dispatch(setScientificMode(settings.scientificMode));
      }
      
      // Load memory value
      const memory = await getMemoryValue(user.userId);
      setMemoryValue(memory);
      
      // Load calculation history
      await loadHistory();
      
    } catch (error) {
      console.error("Error loading calculator data:", error);
      toast.error("Failed to load calculator data");
    } finally {
      setLoading(false);
    }
  };
  
  // Load calculation history from the database
  const loadHistory = async () => {
    if (!user) return;
    
    try {
      setHistoryLoading(true);
      const historyData = await getCalculationHistory(user.userId);
      
      if (historyData && historyData.length > 0) {
        const formattedHistory = historyData.map(item => ({
          calculation: item.calculation,
          result: item.result,
          timestamp: item.timestamp
        }));
        
        setHistory(formattedHistory);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load calculation history");
    } finally {
      setHistoryLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) loadCalculatorData();
  }, []);

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

  const clearHistory = async () => {
    if (!user) {
      toast.error("Please log in to clear history");
      return;
    }
    
    try {
      setHistoryLoading(true);
      const success = await clearCalculationHistory(user.userId);
      if (success) {
        setHistory([]);
        toast.success("History cleared");
      }
    } catch (error) {
      toast.error("Failed to clear history");
    } finally {
      setHistoryLoading(false);
    }
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
      case '%':
        return (firstValue * secondValue) / 100;
      case '^':
        return Math.pow(firstValue, secondValue);
      default:
        return secondValue;
    }
  };

  const performScientificOperation = (operation, value) => {
    const inputValue = parseFloat(value || displayValue);
    let result;
    let calculationDisplay;

    try {
      switch (operation) {
        case 'sqrt':
          result = Math.sqrt(inputValue);
          calculationDisplay = `√(${inputValue}) = ${result}`;
          break;
        case 'square':
          result = Math.pow(inputValue, 2);
          calculationDisplay = `${inputValue}² = ${result}`;
          break;
        case 'cube':
          result = Math.pow(inputValue, 3);
          calculationDisplay = `${inputValue}³ = ${result}`;
          break;
        case '1/x':
          result = 1 / inputValue;
          calculationDisplay = `1/${inputValue} = ${result}`;
          break;
        case 'exp':
          result = Math.exp(inputValue);
          calculationDisplay = `e^${inputValue} = ${result}`;
          break;
        case 'ln':
          result = Math.log(inputValue);
          calculationDisplay = `ln(${inputValue}) = ${result}`;
          break;
      }
      
      setDisplayValue(String(result));
      setWaitingForOperand(true);
      addToHistory(calculationDisplay, result);
    } 
    catch (error) {
      toast.error(`Error: ${error.message}`);
      setDisplayValue('Error');
      setWaitingForOperand(true);
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
    
    await addToHistory(calculation, result);
  };

  const performTrigOperation = (operation) => {
    const inputValue = parseFloat(displayValue);
    let result;
    let calculationDisplay;
    
    // Convert to radians if in degree mode
    const valueInRadians = degrees ? inputValue * (Math.PI / 180) : inputValue;
    const valueForCalculation = shiftMode ? inputValue : valueInRadians;
    
    try {
      switch (operation) {
        case 'sin':
          result = shiftMode ? Math.asin(inputValue) : Math.sin(valueInRadians);
          calculationDisplay = shiftMode 
            ? `asin(${inputValue}) = ${result}` 
            : `sin(${inputValue}${degrees ? '°' : ' rad'}) = ${result}`;
          break;
        case 'cos':
          result = shiftMode ? Math.acos(inputValue) : Math.cos(valueInRadians);
          calculationDisplay = shiftMode 
            ? `acos(${inputValue}) = ${result}` 
            : `cos(${inputValue}${degrees ? '°' : ' rad'}) = ${result}`;
          break;
        case 'tan':
          result = shiftMode ? Math.atan(inputValue) : Math.tan(valueInRadians);
          calculationDisplay = shiftMode 
            ? `atan(${inputValue}) = ${result}` 
            : `tan(${inputValue}${degrees ? '°' : ' rad'}) = ${result}`;
          break;
        case 'log10':
          result = Math.log10(inputValue);
          calculationDisplay = `log₁₀(${inputValue}) = ${result}`;
          break;
        case 'log2':
          result = Math.log2(inputValue);
          calculationDisplay = `log₂(${inputValue}) = ${result}`;
          break;
        default:
          return;
      }
      
      setDisplayValue(String(result));
      setWaitingForOperand(true);
      addToHistory(calculationDisplay, result);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      setDisplayValue('Error');
      setWaitingForOperand(true);
    }
  };

  const handleConstant = (constant) => {
    let value;
    let name;
    
    switch (constant) {
      case 'pi':
        value = Math.PI;
        name = 'π';
        break;
      case 'e':
        value = Math.E;
        name = 'e';
        break;
      default:
        return;
    }
    
    setDisplayValue(String(value));
    setWaitingForOperand(true);
    toast.info(`Inserted constant: ${name}`);
  };

  const handleScientificEquals = () => {
    try {
      // Use mathjs to evaluate complex expressions
      const result = math.evaluate(displayValue);
      const calculation = `${displayValue} = ${result}`;
      setDisplayValue(String(result));
      setWaitingForOperand(true);
      addToHistory(calculation, result);
    } 
    catch (error) {
      toast.error(`Error: ${error.message}`);
      setDisplayValue('Error');
    }
  };
  
  // Memory functions
  const handleMemoryOperation = (operation) => {
    if (!user) {
      toast.error("Please login to use memory functions");
      return;
    }
    
    const currentValue = parseFloat(displayValue);
    
    switch (operation) {
      case 'MS':
        saveMemoryToDatabase(currentValue);
        break;
      case 'M+':
        saveMemoryToDatabase(memoryValue + currentValue);
        break;
      case 'M-':
        saveMemoryToDatabase(memoryValue - currentValue);
        break;
      case 'MR':
        setDisplayValue(String(memoryValue));
        setWaitingForOperand(true);
        toast.info(`Recalled memory value: ${memoryValue}`);
        break;
      case 'MC':
        saveMemoryToDatabase(0);
        toast.info("Memory cleared");
        break;
      default:
        return;
    }
  };
  
  // Save memory value to the database
  const saveMemoryToDatabase = async (value) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const success = await saveMemoryValue(user.userId, value);
      if (success) {
        setMemoryValue(value);
        if (value === 0) {
          toast.info("Memory cleared");
        } else {
          toast.info(`Memory updated: ${value}`);
        }
      }
    } catch (error) {
      console.error("Error saving memory value:", error);
      toast.error("Failed to update memory");
    } finally {
      setLoading(false);
    }
  };
  
  // Save calculator mode to the database
  const saveCalculatorMode = async (isScientific) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await saveCalculatorSettings(user.userId, {
        scientificMode: isScientific,
        angleMode: degrees ? 'degrees' : 'radians',
        darkMode: document.documentElement.classList.contains('dark')
      });
    } catch (error) {
      console.error("Error saving calculator mode:", error);
      toast.error("Failed to save calculator mode");
    } finally {
      setLoading(false);
    }
  };
  
  // Save angle mode to the database
  const saveAngleMode = async (isDegrees) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await saveCalculatorSettings(user.userId, {
        scientificMode: scientificMode,
        angleMode: isDegrees ? 'degrees' : 'radians',
        darkMode: document.documentElement.classList.contains('dark')
      });
    } catch (error) {
      console.error("Error saving angle mode:", error);
      toast.error("Failed to save angle mode");
    } finally {
      setLoading(false);
    }
  };
  
  // Save dark mode to the database
  const saveDarkMode = async (isDark) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await saveCalculatorSettings(user.userId, {
        scientificMode: scientificMode,
        angleMode: degrees ? 'degrees' : 'radians',
        darkMode: isDark
      });
    } catch (error) {
      console.error("Error saving dark mode:", error);
      toast.error("Failed to save dark mode setting");
    } finally {
      setLoading(false);
    }
  };
  
  // Memory functions
  const handleMemoryOperation = (operation) => {
    if (!user) {
      toast.error("Please login to use memory functions");
      return;
    }
    
    const currentValue = parseFloat(displayValue);
    
    switch (operation) {
      case 'MS':
        saveMemoryToDatabase(currentValue);
        break;
      case 'M+':
        saveMemoryToDatabase(memoryValue + currentValue);
        break;
      case 'M-':
        saveMemoryToDatabase(memoryValue - currentValue);
        break;
      case 'MR':
        setDisplayValue(String(memoryValue));
        setWaitingForOperand(true);
        toast.info(`Recalled memory value: ${memoryValue}`);
        break;
      case 'MC':
        saveMemoryToDatabase(0);
        toast.info("Memory cleared");
        break;
      default:
        return;
    }
  };
  // Memory functions

  const toggleCalculatorMode = () => {
    const newMode = !scientificMode;
    setScientificMode(newMode);
    saveCalculatorMode(newMode);
    toast.info(`Switched to ${newMode ? 'scientific' : 'basic'} calculator`);
  };

  const toggleAngleMode = () => {
    const newDegrees = !degrees;
    setDegrees(newDegrees);
    saveAngleMode(newDegrees);
    toast.info(`Switched to ${newDegrees ? 'degrees' : 'radians'}`);
  };
  
  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      saveDarkMode(false);
      toast.info("Switched to light mode", { icon: "🌞" });
    } else {
      document.documentElement.classList.add('dark');
      saveDarkMode(true);
      toast.info("Switched to dark mode", { icon: "🌙" });
    }
    dispatch(setDarkMode(!isDark));
  };

  const toggleShiftMode = () => {
    setShiftMode(!shiftMode);
    toast.info(`${!shiftMode ? 'Inverse' : 'Regular'} functions activated`);
  };

  const addToHistory = (calculation, result) => {
    if (!user) return;
    
    const newEntry = {
      calculation,
      result: String(result),
      timestamp: new Date().toISOString()
    };
    
    // Update local state first for immediate feedback
    setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
    
    // Then save to the database
    saveCalculationToDatabase(calculation, result);
  };
  
  // Save calculation to the database
  const saveCalculationToDatabase = async (calculation, result) => {
    if (!user) return;
    
    try {
      const savedCalculation = await saveCalculation(user.userId, calculation, result);
      if (savedCalculation) {
        // We already updated the local state, so no need to do anything else
        // This is just to ensure the calculation is saved to the database
      }
    } catch (error) {
      console.error("Error saving calculation to database:", error);
      // We don't show an error toast here to avoid disrupting the user experience
      // The calculation is still shown in the local history
    }
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

  // Scientific Calculator Component
  const ScientificCalculator = () => (
    <div className="grid grid-cols-5 gap-3">
      {/* Row 1 */}
      <button
        onClick={toggleAngleMode}
        className="calculator-button calculator-action"
      >
        {degrees ? 'DEG' : 'RAD'}
      </button>
      <button
        onClick={toggleShiftMode}
        className={`calculator-button ${shiftMode ? 'calculator-trig' : 'calculator-action'}`}
      >
        {shiftMode ? 'INV' : 'SHIFT'}
      </button>
      <button
        onClick={() => handleConstant('pi')}
        className="calculator-button calculator-constant"
      >
        <PiIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleConstant('e')}
        className="calculator-button calculator-constant"
      >
        e
      </button>
      <button
        onClick={clearDisplay}
        className="calculator-button calculator-clear"
      >
        AC
      </button>

      {/* Row 2 */}
      <button
        onClick={() => performTrigOperation('sin')}
        className="calculator-button calculator-trig"
      >
        {shiftMode ? 'asin' : 'sin'}
      </button>
      <button
        onClick={() => performTrigOperation('cos')}
        className="calculator-button calculator-trig"
      >
        {shiftMode ? 'acos' : 'cos'}
      </button>
      <button
        onClick={() => performTrigOperation('tan')}
        className="calculator-button calculator-trig"
      >
        {shiftMode ? 'atan' : 'tan'}
      </button>
      <button
        onClick={() => performScientificOperation('1/x')}
        className="calculator-button calculator-scientific"
      >
        1/x
      </button>
      <button
        onClick={clearEntry}
        className="calculator-button calculator-action"
      >
        CE
      </button>

      {/* Row 3 */}
      <button
        onClick={() => performScientificOperation('square')}
        className="calculator-button calculator-scientific"
      >
        x²
      </button>
      <button
        onClick={() => performScientificOperation('cube')}
        className="calculator-button calculator-scientific"
      >
        x³
      </button>
      <button
        onClick={() => performOperation('^')}
        className="calculator-button calculator-scientific"
      >
        x<sup>y</sup>
      </button>
      <button
        onClick={() => performOperation('%')}
        className="calculator-button calculator-operator"
      >
        <PercentIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => performOperation('÷')}
        className="calculator-button calculator-operator"
      >
        ÷
      </button>

      {/* Row 4 */}
      <button
        onClick={() => performScientificOperation('sqrt')}
        className="calculator-button calculator-scientific"
      >
        √x
      </button>
      <button
        onClick={() => performScientificOperation('exp')}
        className="calculator-button calculator-scientific"
      >
        e<sup>x</sup>
      </button>
      <button
        onClick={() => performScientificOperation('ln')}
        className="calculator-button calculator-scientific"
      >
        ln
      </button>
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

      {/* Row 5 */}
      <button
        onClick={() => performTrigOperation('log10')}
        className="calculator-button calculator-scientific"
      >
        log₁₀
      </button>
      <button
        onClick={() => performTrigOperation('log2')}
        className="calculator-button calculator-scientific"
      >
        log₂
      </button>
      <button 
        onClick={() => handleMemoryOperation('MR')} 
        className="calculator-button calculator-memory"
      >MR</button>
      <button
        onClick={() => inputDigit(9)}
        className="calculator-button calculator-number"
      >
        9
      </button>
      <button
        onClick={() => performOperation('×')}
        className="calculator-button calculator-operator"
      >
        ×
      </button>

      {/* Row 6 */}
      <button
        onClick={() => handleMemoryOperation('MC')}
        className="calculator-button calculator-memory"
      >
        MC
      </button>
      <button
        onClick={() => handleMemoryOperation('M+')}
        className="calculator-button calculator-memory"
      >
        M+
      </button>
      <button
        onClick={() => handleMemoryOperation('M-')}
        className="calculator-button calculator-memory"
      >
        M-
      </button>
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

      {/* Row 7 */}
      <button
        onClick={() => inputDigit('(')}
        className="calculator-button calculator-scientific"
      >
        (
      </button>
      <button
        onClick={() => inputDigit(')')}
        className="calculator-button calculator-scientific"
      >
        )
      </button>
      <button
        onClick={toggleCalculatorMode}
        className="calculator-button calculator-mode-switch"
      >
        <Calculator className="w-5 h-5" />
      </button>
      <button
        onClick={() => inputDigit(6)}
        className="calculator-button calculator-number"
      >
        6
      </button>
      <button
        onClick={() => performOperation('-')}
        className="calculator-button calculator-operator"
      >
        -
      </button>

      {/* Row 8-9 */}
      <button
        onClick={() => inputDigit('0')}
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
        onClick={() => performOperation('+')}
        className="calculator-button calculator-operator"
      >
        +
      </button>
      <button
        onClick={scientificMode ? handleScientificEquals : handleEquals}
        className="calculator-button calculator-equals col-span-2"
      >
        =
      </button>
    </div>
  );

  // Basic Calculator Component
  const BasicCalculator = () => (
    <div className="grid grid-cols-4 gap-3">
      {/* Row 1 */}
      <button 
        onClick={toggleCalculatorMode} 
        className="calculator-button calculator-mode-switch col-span-2"
      >
        <Functions className="w-5 h-5 mr-2" />
        <span>Scientific Mode</span>
      </button>
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
      
      {/* Memory buttons row */}
      <button
        onClick={() => handleMemoryOperation('MC')}
        className="calculator-button calculator-memory"
      >
        MC
      </button>
      <button
        onClick={() => handleMemoryOperation('MR')}
        className="calculator-button calculator-memory"
      >
        MR
      </button>
      <button
        onClick={() => handleMemoryOperation('MS')}
        className="calculator-button calculator-memory"
      >
        MS
      </button>
      <button
        onClick={() => handleMemoryOperation('M+')}
        className="calculator-button calculator-memory"
      >
        M+
      </button>
      
      <button
        onClick={() => handleMemoryOperation('M-')}
        className="calculator-button calculator-memory col-span-4"
      >
        M-
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
        onClick={() => performOperation('÷')} 
        className="calculator-button calculator-operator"
      >
        ÷
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
        onClick={() => performOperation('×')} 
        className="calculator-button calculator-operator"
      >
        ×
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
        onClick={() => performOperation('-')} 
        className="calculator-button calculator-operator"
      >
        -
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
      <button 
        onClick={() => performOperation('+')} 
        className="calculator-button calculator-operator"
      >
        +
      </button>
      
      {/* Row 6 */}
      <button 
        onClick={handleEquals} 
        className="calculator-button calculator-equals col-span-4"
      >
        =
      </button>
    </div>
  );

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
          {scientificMode ? <ScientificCalculator /> : <BasicCalculator />}

          {/* History Toggle - Mobile Only */}
          <motion.button
            disabled={historyLoading}
            className={`mt-6 md:hidden w-full flex items-center justify-center gap-2 text-primary dark:text-primary-light py-3 rounded-xl border border-surface-200 dark:border-surface-700 ${
              historyLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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

export default MainFeature;

// History Panel Component - Moved outside MainFeature to be a top-level component
// Moved outside MainFeature to make it a top-level component
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
        ) : history.map ? (
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
        ) : (
          <div className="history-empty">
            <p>Loading history...</p>
          </div>
       )}
      </div>
    </>
  );
};