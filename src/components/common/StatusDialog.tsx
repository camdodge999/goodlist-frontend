"use client";

import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

interface StatusDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  type: 'success' | 'error' | null;
  message: string;
  title?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function StatusDialog({
  isOpen,
  setIsOpen,
  type,
  message,
  title,
  buttonText = "ตกลง",
  onButtonClick,
}: StatusDialogProps) {
  if (!type) return null;
  
  const isSuccess = type === 'success';
  const dialogTitle = title || (isSuccess ? "สำเร็จ" : "เกิดข้อผิดพลาด");
  const iconColor = isSuccess ? "text-green-500" : "text-red-500";
  const icon = isSuccess ? faCheckCircle : faExclamationCircle;

  const handleButtonClick = () => {
    setIsOpen(false);
    if (onButtonClick) {
      onButtonClick();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl p-8">
        <DialogHeader className="space-y-6">
          <div className={`flex justify-center mb-6 ${iconColor}`}>
            <FontAwesomeIcon icon={icon} className="text-6xl" />
          </div>
          <DialogTitle className="text-3xl font-bold text-center">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription id="dialog-description" className="text-center pt-4 text-lg">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-8">
          <Button
            variant="primary"
            onClick={handleButtonClick}
            className="min-w-[120px] text-lg py-6 cursor-pointer"
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 