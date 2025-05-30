import { NextRequest, NextResponse } from "next/server";
import { BodyResponse } from "@/types/response";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { UserResponse } from "@/types/users";
import { validateCSRFMiddleware } from "@/lib/csrf";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";
import { sanitizeFormData } from "@/lib/input-sanitizer";

export async function POST(request: NextRequest): Promise<NextResponse<BodyResponse<UserResponse>>> {
  try {
    // 1. Rate limiting check (now async)
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.REGISTRATION, 'register');
    
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { 
          statusCode: 429,
          message: `Too many registration attempts. Try again in ${rateLimitResult.retryAfter} seconds.`, 
          data: undefined
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '3600',
            'X-RateLimit-Limit': RATE_LIMITS.REGISTRATION.tokensPerInterval.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          }
        }
      );
    }

    // 2. Get request body
    const body = await request.json();
    
    // 3. CSRF validation
    const csrfToken = request.headers.get('x-csrf-token') || body._csrf;
    if (!validateCSRFMiddleware(csrfToken)) {
      return NextResponse.json(
        { 
          statusCode: 403,
          message: "Invalid or missing CSRF token", 
          data: undefined
        },
        { status: 403 }
      );
    }

    // 4. Honeypot check (simple bot detection)
    if (body.website && body.website.trim() !== '') {
      // Honeypot field was filled - likely a bot
      return NextResponse.json(
        { 
          statusCode: 400,
          message: "Invalid request", 
          data: undefined
        },
        { status: 400 }
      );
    }

    // 5. Input sanitization and validation
    const sanitizationConfig = {
      displayName: { 
        maxLength: 50, 
        required: true, 
        type: 'text' as const 
      },
      email: { 
        maxLength: 255, 
        required: true, 
        type: 'email' as const 
      },
      password: { 
        maxLength: 128, 
        required: true, 
        type: 'text' as const 
      },
    };

    const sanitizationResult = sanitizeFormData(body, sanitizationConfig);
    
    if (!sanitizationResult.isValid) {
      const errorMessages = Object.entries(sanitizationResult.errors)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('; ');
      
      return NextResponse.json(
        { 
          statusCode: 400,
          message: `Validation failed: ${errorMessages}`, 
          data: undefined
        },
        { status: 400 }
      );
    }

    const sanitizedData = sanitizationResult.sanitized;

    // 6. Additional validation
    if (!sanitizedData.displayName || !sanitizedData.email || !sanitizedData.password) {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: "Display name, email, and password are required", 
          data: undefined
        },
        { status: 400 }
      );
    }

    // 7. Password strength validation
    if (sanitizedData.password.length < 8) {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: "Password must be at least 8 characters long", 
          data: undefined
        },
        { status: 400 }
      );
    }

    // 8. Send request to backend with sanitized data
    const result = await fetchWithAuth<BodyResponse<UserResponse>>({
      request,
      url: `${process.env.NEXTAUTH_BACKEND_URL}/api/auth/register`,
      method: 'POST',
      body: {
        displayName: sanitizedData.displayName,
        email: sanitizedData.email,
        password: sanitizedData.password,
      },
    });

    if(result.statusCode === 200){
      return NextResponse.json({  
        statusCode: 201,
        message: "User created successfully",
        data: result?.data 
      }, { 
        status: 201,
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS.REGISTRATION.tokensPerInterval.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        }
      });
    } else {
      return NextResponse.json(
        { 
          statusCode: 400,
          message: result.message || "Failed to create user", 
          data: undefined   
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { 
        statusCode: 500,
        message: "Internal server error", 
        data: undefined 
      },
      { status: 500 }
    );
  }
}

