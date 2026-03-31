import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * NativeSelect - Einfache native HTML Select ohne Radix UI
 * Funktioniert GARANTIERT ohne Crashes
 */
export const NativeSelect = forwardRef(({ 
  options = [],
  placeholder = "Bitte auswählen",
  className = "",
  ...props
}, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input",
        "bg-transparent px-3 py-2 text-sm shadow-sm",
        "ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "appearance-none cursor-pointer",
        "dark:bg-slate-800 dark:text-white dark:border-slate-600",
        className
      )}
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

NativeSelect.displayName = 'NativeSelect';
