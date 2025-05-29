import AdminPage from "@/components/pages/AdminPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
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
      `${process.env.NEXTAUTH_BACKEND_URL}/api/store/`,
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
      console.error(`Error fetching admin stores: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    if (data.statusCode === 200 && data.data?.storeDetail) {
      return data.data.storeDetail;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching admin stores server-side:', error);
    return [];
  }
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // Fetch stores data server-side
  const initialStores = session.user.token 
    ? await fetchAdminStoresServerSide(session.user.token)
    : [];

  return <AdminPage initialStores={initialStores} />;
} 