"use client";

import { Dispatch, SetStateAction, useRef } from "react";
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
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function ConfirmDialog({
  isOpen,
  setIsOpen,
  message,
  title = "ยืนยัน",
  confirmText = "ใช่",
  cancelText = "ไม่",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isHandlingClick = useRef(false);

  const handleConfirm = () => {
    if (isHandlingClick.current) return;
    isHandlingClick.current = true;

    setIsOpen(false);

    // Use setTimeout to ensure the dialog closing animation completes
    // before executing the callback to prevent UI glitches
    if (onConfirm) {
      setTimeout(() => {
        onConfirm();
        isHandlingClick.current = false;
      }, 100);
    } else {
      setTimeout(() => {
        isHandlingClick.current = false;
      }, 100);
    }
  };

  const handleCancel = () => {
    if (isHandlingClick.current) return;
    isHandlingClick.current = true;

    setIsOpen(false);

    // Use setTimeout to ensure the dialog closing animation completes
    // before executing the callback to prevent UI glitches
    if (onCancel) {
      setTimeout(() => {
        onCancel();
        isHandlingClick.current = false;
      }, 100);
    } else {
      setTimeout(() => {
        isHandlingClick.current = false;
      }, 100);
    }
  };

  // Handle dialog close from outside (like clicking backdrop)
  const handleOpenChange = (open: boolean) => {
    if (isHandlingClick.current) return;
    if (!open && onCancel) {
      handleCancel();
    } else {
      setIsOpen(open);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl p-8" aria-describedby={undefined}>
        <DialogHeader className="space-y-6">
          <div className="flex justify-center mb-6 text-amber-500">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-6xl" />
          </div>
          <DialogTitle className="text-3xl font-bold text-center">
            {title}
          </DialogTitle>
          <DialogDescription id="dialog-description" className="text-center pt-4 text-lg">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-8 gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="min-w-[120px] text-lg py-6 cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="min-w-[120px] text-lg py-6 cursor-pointer"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 