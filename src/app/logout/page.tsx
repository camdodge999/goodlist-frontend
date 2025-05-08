"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function LogoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Get user email for the success message
      const userEmail = session?.user?.email;
      
      await signOut({ redirect: false });
      
      // Show success toast
      toast({
        title: "ออกจากระบบสำเร็จ",
        description: userEmail ? `คุณได้ออกจากระบบบัญชี ${userEmail} เรียบร้อยแล้ว` : "คุณได้ออกจากระบบเรียบร้อยแล้ว",
        variant: "default",
      });
      
      // Redirect after a short delay to show the toast
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      setError("ขออภัย เกิดข้อผิดพลาดในการออกจากระบบ กรุณาลองอีกครั้ง");
      setIsLoggingOut(false);
      
      // Show error toast
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากระบบได้ กรุณาลองอีกครั้ง",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setOpen(false);
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการออกจากระบบ</AlertDialogTitle>
            <AlertDialogDescription>
              {session?.user?.email ? (
                <>คุณต้องการออกจากระบบบัญชี <span className="font-medium">{session.user.email}</span> ใช่หรือไม่?</>
              ) : (
                <>คุณต้องการออกจากระบบใช่หรือไม่?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {isLoggingOut ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-center text-gray-600">กำลังออกจากระบบ...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm mb-4">
              {error}
            </div>
          ) : null}
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isLoggingOut}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout} 
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              ออกจากระบบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 