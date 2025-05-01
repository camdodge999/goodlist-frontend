import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Get credentials from environment variables
    const username = process.env.NEXTAUTH_DASHBOARD_USERNAME;
    const password = process.env.NEXTAUTH_DASHBOARD_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        {
          status: "error",
          message: "Dashboard credentials not configured",
        },
        { status: 500 }
      );
    }

    // Authenticate with backend
    const response = await fetch(`${process.env.NEXTAUTH_BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          status: "error",
          message: errorData.message || "Authentication failed",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Set cookie with a very long expiration (effectively "forever")
    // The max-age is set to 10 years (31536000 seconds)
    const cookiesInstance = await cookies();
    cookiesInstance.set({
      name: "dashboard-monitor",
      value: data.data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 31536000,
      path: "/",
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Dashboard monitor token set successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting dashboard monitor token:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to set dashboard monitor token",
      },
      { status: 500 }
    );
  }
}
