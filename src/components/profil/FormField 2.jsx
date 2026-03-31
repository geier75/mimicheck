import React from 'react';

/**
 * Wiederverwendbares Formularfeld
 */
export function FormField({ 
  label, 
  required, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  hint,
  className = ''
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <input 
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:border-cyan-500/50 focus:outline-none transition-colors"
      />
      {hint && <p className="text-xs text-white/40 mt-1">{hint}</p>}
    </div>
  );
}

/**
 * Select/Dropdown Feld
 */
export function SelectField({ 
  label, 
  required, 
  value, 
  onChange, 
  options,
  placeholder = 'Bitte wählen...',
  className = ''
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <select 
        value={value || ''}
        onChange={onChange}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

/**
 * Checkbox mit Label
 */
export function CheckboxField({
  label,
  checked,
  onChange,
  required,
  badge,
  description,
  details,
  className = ''
}) {
  return (
    <div 
      className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
        checked 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-white/5 border-white/10 hover:border-white/20'
      } ${className}`}
      onClick={onChange}
    >
      <div className="flex items-start gap-4">
        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
          checked 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent' 
            : 'border-white/20'
        }`}>
          {checked && <span className="text-white text-xs">✓</span>}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-semibold text-white">{label}</span>
            {required && <span className="text-rose-400">*</span>}
            {badge && (
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                badge === 'PFLICHT' ? 'bg-emerald-500/20 text-emerald-300' :
                badge === 'OPTIONAL' ? 'bg-blue-500/20 text-blue-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>{badge}</span>
            )}
          </div>
          {description && <p className="text-sm text-white/70 mb-3">{description}</p>}
          {details && (
            <details className="text-xs text-white/50">
              <summary className="cursor-pointer hover:text-white/70">Weitere Details anzeigen</summary>
              <div className="mt-2 p-3 bg-white/5 rounded-lg">{details}</div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Textarea Feld
 */
export function TextareaField({
  label,
  required,
  value,
  onChange,
  placeholder,
  rows = 4,
  className = ''
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <textarea
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm resize-none focus:border-cyan-500/50 focus:outline-none transition-colors"
      />
    </div>
  );
}

/**
 * Info-Box
 */
export function InfoBox({ title, children, icon = 'ℹ️', variant = 'info' }) {
  const variants = {
    info: 'bg-cyan-500/10 border-cyan-500/20',
    success: 'bg-emerald-500/10 border-emerald-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    error: 'bg-rose-500/10 border-rose-500/20'
  };

  return (
    <div className={`p-5 rounded-xl border ${variants[variant]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          {title && <h4 className="text-sm font-semibold text-cyan-300 mb-2">{title}</h4>}
          {children}
        </div>
      </div>
    </div>
  );
}
