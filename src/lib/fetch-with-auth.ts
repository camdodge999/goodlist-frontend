import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

// Define possible body types
type RequestBody = FormData | object | null;

export async function fetchWithAuth<T>({
  request,
  url,
  method,
  body,
  extendHeaders,
}: {
  request: NextRequest;
  url: string;
  method: string;
  body?: RequestBody;
  extendHeaders?: HeadersInit;
}): Promise<T> {
  // Set up headers
  const headers: HeadersInit = {};
  
  // First, try to get the Authorization header from the original request
  const clientAuthHeader = request.headers.get('Authorization');
  
  if (clientAuthHeader) {
    // If client provided an Authorization header, use it
    headers.Authorization = clientAuthHeader;
  } else {
    // Otherwise, extract JWT token from the NextAuth session
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Get the raw JWT token from the token object
    const headerToken = token?.token as string | undefined;
    headers.Authorization = `Bearer ${headerToken || ""}`;
  }

  let bodyData: string | FormData | null = null;

  // Handle body preparation
  if (body) {
    if (body instanceof FormData) {
      // Don't set Content-Type for FormData - browser will set it automatically with boundary
      bodyData = body;
    } else {
      headers["Content-Type"] = "application/json";
      bodyData = JSON.stringify(body);
    }
  }

  // Make the authenticated request to the backend
  const response = await fetch(url, {
    method,
    headers: { ...headers, ...extendHeaders },
    body: bodyData,
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    const message = errorResponse.message || `HTTP error ${response.status}`;
    throw new Error(`Failed to fetch data: ${message}`);
  }

  return response.json() as Promise<T>;
}