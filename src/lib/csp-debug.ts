'use client';

/**
 * CSP Debug utility for development
 * Helps identify and log CSP violations
 */
export class CSPDebugger {
  private static instance: CSPDebugger;
  private violations: Array<{
    directive: string;
    blockedURI: string;
    violatedDirective: string;
    timestamp: Date;
  }> = [];

  private constructor() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      this.setupViolationListener();
    }
  }

  static getInstance(): CSPDebugger {
    if (!CSPDebugger.instance) {
      CSPDebugger.instance = new CSPDebugger();
    }
    return CSPDebugger.instance;
  }

  private setupViolationListener() {
    document.addEventListener('securitypolicyviolation', (event) => {
      const violation = {
        directive: event.effectiveDirective,
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        timestamp: new Date(),
      };

      this.violations.push(violation);
      
      console.group('🚨 CSP Violation Detected');
      console.error('Directive:', violation.directive);
      console.error('Blocked URI:', violation.blockedURI);
      console.error('Violated Directive:', violation.violatedDirective);
      console.error('Timestamp:', violation.timestamp);
      console.error('Full Event:', event);
      console.groupEnd();

      // Provide helpful suggestions
      this.provideSuggestions(violation);
    });
  }

  private provideSuggestions(violation: any) {
    const { directive, blockedURI } = violation;

    console.group('💡 CSP Fix Suggestions');

    if (directive === 'style-src') {
      if (blockedURI === 'inline') {
        console.log('• Add nonce attribute to inline styles');
        console.log('• Use the createNonceStyle utility from @/lib/nonce');
        console.log('• Wrap components with CSPWrapper if using third-party libraries');
      } else {
        console.log(`• Add "${blockedURI}" to style-src directive in middleware.ts`);
      }
    }

    if (directive === 'script-src') {
      if (blockedURI === 'inline') {
        console.log('• Add nonce attribute to inline scripts');
        console.log('• Use the createNonceScript utility from @/lib/nonce');
      } else {
        console.log(`• Add "${blockedURI}" to script-src directive in middleware.ts`);
      }
    }

    if (directive === 'img-src') {
      console.log(`• Add "${blockedURI}" to img-src directive in middleware.ts`);
    }

    if (directive === 'connect-src') {
      console.log(`• Add "${blockedURI}" to connect-src directive in middleware.ts`);
    }

    console.groupEnd();
  }

  getViolations() {
    return this.violations;
  }

  clearViolations() {
    this.violations = [];
  }

  logSummary() {
    if (this.violations.length === 0) {
      console.log('✅ No CSP violations detected');
      return;
    }

    console.group(`📊 CSP Violations Summary (${this.violations.length} total)`);
    
    const byDirective = this.violations.reduce((acc, violation) => {
      acc[violation.directive] = (acc[violation.directive] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(byDirective).forEach(([directive, count]) => {
      console.log(`${directive}: ${count} violations`);
    });

    console.groupEnd();
  }
}

// Auto-initialize in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  CSPDebugger.getInstance();
} 