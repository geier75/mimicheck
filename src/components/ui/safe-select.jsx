import { useState, useEffect, forwardRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

/**
 * SafeSelect - Wrapper um Radix UI Select der React-Crashes verhindert
 * Speziell für React Hook Form Controller
 */
export const SafeSelect = forwardRef(({ 
  value, 
  onValueChange, 
  placeholder = "Bitte auswählen",
  options = [],
  disabled = false,
  className = "",
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);

  // Sync external value with internal state
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleValueChange = (newValue) => {
    setInternalValue(newValue);
    
    // Delay state update to avoid crash
    setTimeout(() => {
      onValueChange?.(newValue);
    }, 0);
  };

  return (
    <Select 
      value={internalValue} 
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

SafeSelect.displayName = 'SafeSelect';
