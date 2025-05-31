import AdminPage from "@/components/pages/AdminPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Store } from "@/types/stores";
import { Metadata } from "next";
import { metadataPages } from "@/consts/metadata";

export const metadata: Metadata = {
  title: metadataPages.admin.title,
  description: metadataPages.admin.description,
};

async function fetchAdminStoresServerSide(token: string): Promise<Store[]> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL }/api/store/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );



    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (data.statusCode === 200 && data.data?.storeDetail) {
      return data.data.storeDetail;
    }
    
    return [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    // Return a minimal redirect response with no body to prevent information leakage
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"), {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Redirect-Security': 'minimal-response'
      }
    });
  }

  // Fetch stores data server-side
  const initialStores = session.user.token 
    ? await fetchAdminStoresServerSide(session.user.token)
    : [];

  return <AdminPage initialStores={initialStores} />;
} 