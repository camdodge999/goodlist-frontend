import { Metadata } from 'next';
import StoresPage from "@/components/pages/StoresPage";
import { StoreProvider } from "@/contexts/StoreContext";

export const metadata: Metadata = {
  title: 'ร้านค้าที่ผ่านการตรวจสอบ | Goodlistseller',
  description: 'ค้นหาร้านค้าออนไลน์ที่ผ่านการตรวจสอบและไว้ใจได้',
};


export default async function Page() {
  return (
    <StoreProvider>
      <StoresPage />
    </StoreProvider>
  );
} 