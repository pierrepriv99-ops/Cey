import React from 'react';
import { tokens } from '../tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  style,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[1],
  };

  const labelStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: error ? tokens.colors.semantic.error : tokens.colors.neutral[700],
  };

  const inputStyle: React.CSSProperties = {
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    fontSize: tokens.typography.fontSize.base,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${error ? tokens.colors.semantic.error : tokens.colors.neutral[300]}`,
    backgroundColor: 'white',
    color: tokens.colors.neutral[900],
    outline: 'none',
    transition: `border-color ${tokens.transitions.fast}`,
    ...style,
  };

  const helperTextStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSize.xs,
    color: error ? tokens.colors.semantic.error : tokens.colors.neutral[500],
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={inputStyle}
        {...props}
      />
      {(error || helperText) && (
        <span style={helperTextStyle}>{error || helperText}</span>
      )}
    </div>
  );
};

export default Input;