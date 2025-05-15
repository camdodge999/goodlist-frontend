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
  body?: RequestBody; // Use specific type union instead of generic here
  extendHeaders?: HeadersInit;
}): Promise<T> {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const headerToken = token ? token.token : null;

  const headers: HeadersInit = {
    Authorization: `Bearer ${headerToken ?? ""}`,
  };

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

  const response = await fetch(url, {
    method,
    headers: { ...headers, ...extendHeaders },
    body: bodyData,
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    const message = errorResponse.message;
    throw new Error(`Failed to fetch data: ${message}`);
  }

  return response.json() as Promise<T>;
}