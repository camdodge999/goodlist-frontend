"use client";

import React from 'react';
import { motion, useMotionSafe } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface AnimationWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  // Motion props
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  // CSS fallback
  fallbackClassName?: string;
  // Element type
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'section' | 'article' | 'header' | 'footer' | 'nav' | 'main' | 'aside';
}

/**
 * Animation wrapper that gracefully falls back to CSS animations
 * when CSP nonces aren't available, following the blog post approach
 */
export default function AnimationWrapper({
  children,
  className,
  initial,
  animate,
  exit,
  transition,
  fallbackClassName = "animate-fade-in-up",
  as = "div",
  style,
  ...props
}: AnimationWrapperProps) {
  const isMotionSafe = useMotionSafe();
  
  // If motion is safe (development or nonce available), use Framer Motion
  if (isMotionSafe) {
    const MotionComponent = motion[as] as any;
    return (
      <MotionComponent
        className={className}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        style={style}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }
  
  // Fallback to CSS-only animations for CSP compliance
  // Use simple conditional rendering for each element type
  const fallbackProps = {
    className: cn(className, fallbackClassName),
    style,
    ...props
  };
  
  switch (as) {
    case 'span':
      return <span {...fallbackProps}>{children}</span>;
    case 'p':
      return <p {...fallbackProps}>{children}</p>;
    case 'h1':
      return <h1 {...fallbackProps}>{children}</h1>;
    case 'h2':
      return <h2 {...fallbackProps}>{children}</h2>;
    case 'h3':
      return <h3 {...fallbackProps}>{children}</h3>;
    case 'h4':
      return <h4 {...fallbackProps}>{children}</h4>;
    case 'h5':
      return <h5 {...fallbackProps}>{children}</h5>;
    case 'h6':
      return <h6 {...fallbackProps}>{children}</h6>;
    case 'section':
      return <section {...fallbackProps}>{children}</section>;
    case 'article':
      return <article {...fallbackProps}>{children}</article>;
    case 'header':
      return <header {...fallbackProps}>{children}</header>;
    case 'footer':
      return <footer {...fallbackProps}>{children}</footer>;
    case 'nav':
      return <nav {...fallbackProps}>{children}</nav>;
    case 'main':
      return <main {...fallbackProps}>{children}</main>;
    case 'aside':
      return <aside {...fallbackProps}>{children}</aside>;
    default:
      return <div {...fallbackProps}>{children}</div>;
  }
}

// Specific animation components with built-in fallbacks
export function FadeInUp({ children, className, delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimationWrapper
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      fallbackClassName="animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </AnimationWrapper>
  );
}

export function ScaleIn({ children, className, delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimationWrapper
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      fallbackClassName="animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </AnimationWrapper>
  );
} 