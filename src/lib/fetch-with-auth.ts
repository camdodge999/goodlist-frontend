import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { Session } from "next-auth";

// Define possible body types
type RequestBody = FormData | object | null;

export async function fetchWithAuth<T>({
  request,
  url,
  method,
  body,
  extendHeaders,
  isFormData = false,
  session
}: {
  request: NextRequest;
  url: string;
  method: string;
  body?: RequestBody;
  extendHeaders?: HeadersInit;
  isFormData?: boolean;
  session?: Session | null;
}): Promise<T> {
  // Set up headers
  const headers: HeadersInit = {};
  
  // First, try to get the Authorization header from the original request
  const clientAuthHeader = request.headers.get('Authorization');
  
  if (clientAuthHeader) {
    // If client provided an Authorization header, use it
    headers.Authorization = clientAuthHeader;
  } else if (session?.user?.token) {
    // If session is passed and has a token, use it
    headers.Authorization = `Bearer ${session.user.token}`;
  } else {
    // Otherwise, extract JWT token from the NextAuth session
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Get the raw JWT token from the token object
    const headerToken = token?.token as string | undefined;
    if (headerToken) {
      headers.Authorization = `Bearer ${headerToken}`;
    }
    // If no token available, proceed without Authorization header
  }

  let bodyData: string | FormData | null = null;

  // Handle body preparation
  if (body) {
    if (body instanceof FormData || isFormData) {
      // Don't set Content-Type for FormData - browser will set it automatically with boundary
      bodyData = body as FormData;
    } else {
      headers["Content-Type"] = "application/json";
      bodyData = JSON.stringify(body);
    }
  }

  // Make the request to the backend
  const response = await fetch(url, {
    method,
    headers: { ...headers, ...extendHeaders },
    body: bodyData,
  });

  // Parse JSON response
  const responseData = await response.json();

  // Don't throw for non-ok responses, let the caller handle them
  return responseData as T;
}