import React from 'react';
import { tokens } from '../tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: tokens.colors.primary[600],
    color: 'white',
    border: 'none',
  },
  secondary: {
    backgroundColor: tokens.colors.neutral[100],
    color: tokens.colors.neutral[900],
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: tokens.colors.primary[600],
    border: `1px solid ${tokens.colors.primary[600]}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: tokens.colors.neutral[700],
    border: 'none',
  },
  danger: {
    backgroundColor: tokens.colors.semantic.error,
    color: 'white',
    border: 'none',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: {
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    fontSize: tokens.typography.fontSize.sm,
  },
  md: {
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    fontSize: tokens.typography.fontSize.base,
  },
  lg: {
    padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
    fontSize: tokens.typography.fontSize.lg,
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[2],
    borderRadius: tokens.borderRadius.md,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: `all ${tokens.transitions.fast}`,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      style={baseStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
};

export default Button;