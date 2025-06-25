
import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { sanitizeInput, validateTextInput } from '@/utils/inputValidation';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLength?: number;
  sanitize?: boolean;
  validateOnChange?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ maxLength = 255, sanitize = true, validateOnChange = false, onValidationChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Sanitize input if enabled
      if (sanitize && props.type !== 'password') {
        value = sanitizeInput(value);
      }
      
      // Enforce max length
      if (value.length > maxLength) {
        value = value.substring(0, maxLength);
      }
      
      // Validate if enabled
      if (validateOnChange && onValidationChange) {
        const isValid = validateTextInput(value, maxLength);
        onValidationChange(isValid);
      }
      
      // Update the event target value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value
        }
      };
      
      if (onChange) {
        onChange(syntheticEvent);
      }
    };

    return (
      <Input
        ref={ref}
        {...props}
        maxLength={maxLength}
        onChange={handleChange}
      />
    );
  }
);

SecureInput.displayName = 'SecureInput';

export default SecureInput;
