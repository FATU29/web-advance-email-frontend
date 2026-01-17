'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

const DEFAULT_SKIP_LINKS: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#sidebar-navigation', label: 'Skip to navigation' },
  { href: '#email-list', label: 'Skip to email list' },
];

interface SkipNavigationProps {
  links?: SkipLink[];
  className?: string;
}

/**
 * Skip Navigation Component
 * Provides keyboard users quick access to main content areas
 * Shows only when focused (Tab key) - hidden otherwise
 */
export function SkipNavigation({
  links = DEFAULT_SKIP_LINKS,
  className,
}: SkipNavigationProps) {
  return (
    <nav
      aria-label="Skip navigation"
      className={cn('sr-only focus-within:not-sr-only', className)}
    >
      <div className="fixed top-0 left-0 right-0 z-[100] bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto p-2 flex gap-2 flex-wrap">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={cn(
                'inline-flex items-center px-4 py-2',
                'text-sm font-medium',
                'bg-primary-foreground/10 hover:bg-primary-foreground/20',
                'border border-primary-foreground/20',
                'rounded-md transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2 focus:ring-offset-primary'
              )}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

/**
 * Main Content Wrapper
 * Use this to wrap your main content area
 */
interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn('focus:outline-none', className)}
      role="main"
      aria-label="Main content"
    >
      {children}
    </main>
  );
}

/**
 * Navigation Wrapper
 * Use this to wrap your sidebar/navigation
 */
interface NavigationWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function NavigationWrapper({
  children,
  className,
}: NavigationWrapperProps) {
  return (
    <nav
      id="sidebar-navigation"
      tabIndex={-1}
      className={cn('focus:outline-none', className)}
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {children}
    </nav>
  );
}

/**
 * Email List Wrapper
 * Use this to wrap your email list
 */
interface EmailListWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function EmailListWrapper({
  children,
  className,
}: EmailListWrapperProps) {
  return (
    <div
      id="email-list"
      tabIndex={-1}
      className={cn('focus:outline-none', className)}
      role="region"
      aria-label="Email list"
    >
      {children}
    </div>
  );
}
