import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showValidation?: boolean;
  id?: string;
  rightLabel?: React.ReactNode;
}

export default function PasswordInput({ 
  value, 
  onChange, 
  placeholder = '••••••••', 
  label = 'Password',
  required = true,
  showValidation = true,
  id = 'password',
  rightLabel
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');
  const [checks, setChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
    noPatterns: false
  });

  useEffect(() => {
    const newChecks = {
      length: value.length >= 8 && value.length <= 20,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*]/.test(value),
      noPatterns: !/(123456|password|qwerty|123|abc)/i.test(value) && !/\s/.test(value)
    };
    setChecks(newChecks);

    const passedCount = Object.values(newChecks).filter(Boolean).length;
    if (passedCount <= 2) setStrength('Weak');
    else if (passedCount <= 4) setStrength('Medium');
    else setStrength('Strong');
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {rightLabel}
          {showValidation && value.length > 0 && (
            <span className={`text-xs font-bold ${
              strength === 'Strong' ? 'text-green-500' : 
              strength === 'Medium' ? 'text-brand-gold' : 'text-red-500'
            }`}>
              {strength === 'Strong' ? 'Strong / मजबूत' : 
               strength === 'Medium' ? 'Medium / मध्यम' : 'Weak / कमज़ोर'}
            </span>
          )}
        </div>
      </div>
      
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-gold outline-none transition-all text-brand-black dark:text-white pr-12"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {showValidation && value.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-[#1e293b]/50 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2 mt-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Requirements / आवश्यकताएँ</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <ValidationRule 
              passed={checks.length} 
              text="8-20 characters" 
              hindi="8-20 अक्षर" 
            />
            <ValidationRule 
              passed={checks.upper} 
              text="Uppercase (A-Z)" 
              hindi="बड़ा अक्षर" 
            />
            <ValidationRule 
              passed={checks.lower} 
              text="Lowercase (a-z)" 
              hindi="छोटा अक्षर" 
            />
            <ValidationRule 
              passed={checks.number} 
              text="Number (0-9)" 
              hindi="नंबर" 
            />
            <ValidationRule 
              passed={checks.special} 
              text="Special (!@#$%)" 
              hindi="विशेष वर्ण" 
            />
            <ValidationRule 
              passed={checks.noPatterns} 
              text="No common patterns" 
              hindi="कोई आसान पैटर्न नहीं" 
            />
          </div>

          {/* Strength Bar */}
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                strength === 'Strong' ? 'w-full bg-green-500' : 
                strength === 'Medium' ? 'w-2/3 bg-brand-gold' : 'w-1/3 bg-red-500'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ValidationRule({ passed, text, hindi }: { passed: boolean; text: string; hindi: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors ${passed ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>
      {passed ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
      <span>{text} <span className="opacity-60">| {hindi}</span></span>
    </div>
  );
}
