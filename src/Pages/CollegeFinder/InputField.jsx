// src/components/questionnaire/InputField.jsx
import { useRef, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

export const InputField = ({
  label,
  field,
  type = 'text',
  options = null,
  required = false,
  placeholder = '',
  description = '',
  value,
  onChange,
  hasError,
  decimalAllowed = true // New prop: default true for number fields needing decimals (e.g., GPA)
}) => {
  const inputRef = useRef(null);

  const handleInputChange = useCallback(
    (e) => {
      let newValue = e.target.value;
      // For number inputs, filter to allow only digits and optional decimal point
      if (type === 'number') {
        if (decimalAllowed) {
          newValue = newValue.replace(/[^0-9.]/g, ''); // Allow digits and dots
          // Ensure only one dot
          const parts = newValue.split('.');
          if (parts.length > 2) {
            newValue = parts[0] + '.' + parts.slice(1).join('');
          }
        } else {
          newValue = newValue.replace(/[^0-9]/g, ''); // Only digits, no decimals
        }
      }
      onChange(field, newValue);
    },
    [field, onChange, type, decimalAllowed]
  );

  const handleRadioClick = useCallback(
    (option) => {
      onChange(field, option);
    },
    [field, onChange]
  );

  // Shared Label
  const Label = () => (
    <label className="block text-sm font-medium text-gray-900 min-h-[40px]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  );

  // Always render description space (even if empty)
  const DescriptionBlock = () => (
    <p
      className={`text-xs text-gray-500 min-h-[1.25rem] leading-tight transition-opacity duration-200 ${description ? 'opacity-100' : 'opacity-0'
        }`}
      aria-label={description || 'No description provided'}
    >
      {description || '\u00A0'} {/* Non-breaking space to maintain height */}
    </p>
  );

  // Always reserve space for error
  const ErrorMessage = () =>
    hasError ? (
      <p className="text-red-600 text-xs flex flex-row items-center mt-1">
        <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
        {hasError}
      </p>
    ) : (
      <div className="h-[1.125rem]" />
    );

  // === SELECT ===
  if (type === 'select') {
    return (
      <div className="space-y-2">
        <Label />
        <DescriptionBlock />
        <select
          ref={inputRef}
          value={value || ''}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : value
                ? 'border-[#145044] focus:border-[#145044] focus:ring-[#145044]/20'
                : 'border-gray-300 focus:border-[#145044] focus:ring-[#145044]/20'
            }`}
        >
          {/* <option value=""> {label}</option> */}
          <option value=""> Select</option>

          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ErrorMessage />
      </div>
    );
  }

  // === RADIO ===
  if (type === 'radio') {
    return (
      <div className="space-y-2">
        <Label />
        <DescriptionBlock />
        <div className="grid grid-cols-2 gap-2">
          {options?.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleRadioClick(opt)}
              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${value === opt
                  ? 'border-[#145044] bg-[#145044] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#145044]'
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <ErrorMessage />
      </div>
    );
  }

  // === CHECKBOX ===
  if (type === 'checkbox') {
    const currentValue = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        <Label />
        <DescriptionBlock />
        <div className="space-y-2">
          {options?.map((opt) => (
            <div key={opt} className="flex items-center">
              <input
                type="checkbox"
                id={`${field}-${opt}`}
                checked={currentValue.includes(opt)}
                onChange={(e) => {
                  let newValue = [...currentValue];
                  if (e.target.checked) {
                    newValue.push(opt);
                  } else {
                    newValue = newValue.filter((v) => v !== opt);
                  }
                  onChange(field, newValue);
                }}
                className="h-4 w-4 text-[#145044] focus:ring-[#145044] border-gray-300 rounded"
              />
              <label htmlFor={`${field}-${opt}`} className="ml-2 text-sm text-gray-700">
                {opt}
              </label>
            </div>
          ))}
        </div>
        <ErrorMessage />
      </div>
    );
  }

  // === DEFAULT: TEXT, NUMBER, EMAIL, etc. ===
  return (
    <div className="space-y-2">
      <Label />
      <DescriptionBlock />
      <input
        ref={inputRef}
        type={type}
        inputMode={type === 'number' ? (decimalAllowed ? 'decimal' : 'numeric') : undefined}
        value={value || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : value
              ? 'border-[#145044] focus:border-[#145044] focus:ring-[#145044]/20'
              : 'border-gray-300 focus:border-[#145044] focus:ring-[#145044]/20'
          }`}
      />
      <ErrorMessage />
    </div>
  );
};