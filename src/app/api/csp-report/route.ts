/**
 * CSP Violation Report Endpoint
 * Handles Content Security Policy violation reports
 * Supports both legacy csp-report format and modern Report API format
 */

import { NextRequest, NextResponse } from 'next/server';
import { logCSPViolation, type CSPViolationReport } from '@/lib/csp-utils';

// Modern Report API format
interface ModernCSPReport {
  type: 'csp-violation';
  age: number;
  url: string;
  user_agent: string;
  body: {
    documentURL: string;
    referrer?: string;
    violatedDirective: string;
    effectiveDirective: string;
    originalPolicy: string;
    disposition: 'enforce' | 'report';
    blockedURL?: string;
    lineNumber?: number;
    columnNumber?: number;
    sourceFile?: string;
    statusCode?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let report: CSPViolationReport;
    
    // Handle different content types
    if (contentType.includes('application/reports+json')) {
      // Modern Report API format (array of reports)
      const reports: ModernCSPReport[] = await request.json();
      
      for (const modernReport of reports) {
        if (modernReport.type === 'csp-violation') {
          // Convert modern format to legacy format for processing
          const legacyReport: CSPViolationReport = {
            'csp-report': {
              'document-uri': modernReport.body.documentURL,
              'referrer': modernReport.body.referrer || '',
              'violated-directive': modernReport.body.violatedDirective,
              'effective-directive': modernReport.body.effectiveDirective,
              'original-policy': modernReport.body.originalPolicy,
              'disposition': modernReport.body.disposition,
              'blocked-uri': modernReport.body.blockedURL || '',
              'line-number': modernReport.body.lineNumber || 0,
              'column-number': modernReport.body.columnNumber || 0,
              'source-file': modernReport.body.sourceFile || '',
              'status-code': modernReport.body.statusCode || 0
            }
          };
          
          processViolationReport(legacyReport, request);
        }
      }
    } else {
      // Legacy csp-report format
      report = await request.json();
      processViolationReport(report, request);
    }
    
    return NextResponse.json({ status: 'received' }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing CSP violation report:', error);
    return NextResponse.json(
      { error: 'Failed to process violation report' },
      { status: 400 }
    );
  }
}

function processViolationReport(report: CSPViolationReport, request: NextRequest) {
  // Log the violation for debugging
  logCSPViolation(report);
  
  const violation = report['csp-report'];
  
  // Log structured violation data
  console.log('CSP Violation Report:', {
    timestamp: new Date().toISOString(),
    documentUri: violation['document-uri'],
    violatedDirective: violation['violated-directive'],
    effectiveDirective: violation['effective-directive'],
    blockedUri: violation['blocked-uri'],
    sourceFile: violation['source-file'],
    lineNumber: violation['line-number'],
    columnNumber: violation['column-number'],
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
  });
  
  // Check for common violation patterns that might need attention
  const commonIssues = analyzeViolation(violation);
  if (commonIssues.length > 0) {
    console.warn('Common CSP Issues Detected:', commonIssues);
  }
}

// Analyze violation for common patterns
function analyzeViolation(violation: CSPViolationReport['csp-report']): string[] {
  const issues: string[] = [];
  
  // Check for inline script violations
  if (violation['violated-directive'].includes('script-src') && 
      violation['blocked-uri'] === 'inline') {
    issues.push('Inline script detected - consider using nonce or moving to external file');
  }
  
  // Check for inline style violations
  if (violation['violated-directive'].includes('style-src') && 
      violation['blocked-uri'] === 'inline') {
    issues.push('Inline style detected - consider using CSS classes or style hashes');
  }
  
  // Check for eval violations
  if (violation['violated-directive'].includes('script-src') && 
      violation['blocked-uri'] === 'eval') {
    issues.push('eval() usage detected - consider alternative approaches');
  }
  
  // Check for external resource violations
  if (violation['blocked-uri'].startsWith('http') && 
      !violation['blocked-uri'].includes('goodlist') &&
      !violation['blocked-uri'].includes('unsplash') &&
      !violation['blocked-uri'].includes('fonts.g')) {
    issues.push(`Unexpected external resource: ${violation['blocked-uri']}`);
  }
  
  return issues;
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Content-Type': 'application/json, application/reports+json',
    },
  });
} 