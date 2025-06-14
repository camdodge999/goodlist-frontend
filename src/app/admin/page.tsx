import AdminPage from "@/components/pages/AdminPage";
import { Store } from "@/types/stores";
import { Metadata } from "next";
import { metadataPages } from "@/consts/metadata";
import { requireAdmin } from "@/lib/auth-utils";

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
  // Use the new auth utility - automatically redirects if not admin
  const session = await requireAdmin();

  // Fetch stores data server-side
  const initialStores = session.user.token 
    ? await fetchAdminStoresServerSide(session.user.token)
    : [];

  return <AdminPage initialStores={initialStores} />;
} 