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
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface SuccessDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  title: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function SuccessDialog({
  isOpen,
  setIsOpen,
  title,
  message,
  buttonText = "ตกลง",
  onButtonClick,
}: SuccessDialogProps) {
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
          <div className="flex justify-center mb-6 text-green-500">
            <FontAwesomeIcon icon={faCheckCircle} className="text-6xl" />
          </div>
          <DialogTitle className="text-3xl font-bold text-center">
            {title}
          </DialogTitle>
          <DialogDescription id="success-description" className="text-center pt-4 text-lg">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-8">
          {handleButtonClick && (
            <Button
              variant="primary"
              onClick={handleButtonClick}
              className="min-w-[120px] text-lg py-6 cursor-pointer"
          >
            {buttonText}
          </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 