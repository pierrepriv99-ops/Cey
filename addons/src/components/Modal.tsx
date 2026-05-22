import React, { useEffect } from 'react';
import { tokens } from '../tokens';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles: Record<string, string> = {
  sm: '400px',
  md: '500px',
  lg: '700px',
  xl: '900px',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: tokens.spacing[4],
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: tokens.borderRadius.xl,
    boxShadow: tokens.shadows.xl,
    width: '100%',
    maxWidth: sizeStyles[size],
    maxHeight: '90vh',
    overflow: 'auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing[4],
    borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.neutral[900],
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: tokens.typography.fontSize.xl,
    cursor: 'pointer',
    color: tokens.colors.neutral[500],
    padding: tokens.spacing[1],
  };

  const contentStyle: React.CSSProperties = {
    padding: tokens.spacing[4],
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div style={headerStyle}>
            <h2 style={titleStyle}>{title}</h2>
            <button style={closeButtonStyle} onClick={onClose}>
              ×
            </button>
          </div>
        )}
        <div style={contentStyle}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;