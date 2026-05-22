import React from 'react';
import { tokens } from '../tokens';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: tokens.colors.neutral[50],
    border: `1px solid ${tokens.colors.neutral[200]}`,
  },
  elevated: {
    backgroundColor: 'white',
    boxShadow: tokens.shadows.md,
  },
  outlined: {
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.colors.neutral[300]}`,
  },
};

const paddingStyles: Record<string, string> = {
  none: '0',
  sm: tokens.spacing[3],
  md: tokens.spacing[4],
  lg: tokens.spacing[6],
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const cardStyle: React.CSSProperties = {
    borderRadius: tokens.borderRadius.lg,
    padding: paddingStyles[padding],
    ...variantStyles[variant],
    ...style,
  };

  return <div style={cardStyle}>{children}</div>;
};

export default Card;