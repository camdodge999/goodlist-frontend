import { useState, useCallback } from 'react';

interface DialogOptions {
  title?: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function useShowDialog() {
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successTitle, setSuccessTitle] = useState<string>("สำเร็จ");
  const [errorTitle, setErrorTitle] = useState<string>("เกิดข้อผิดพลาด");
  const [successButtonText, setSuccessButtonText] = useState<string>("ตกลง");
  const [errorButtonText, setErrorButtonText] = useState<string>("ปิด");
  const [onSuccessButtonClick, setOnSuccessButtonClick] = useState<(() => void) | undefined>(undefined);
  const [onErrorButtonClick, setOnErrorButtonClick] = useState<(() => void) | undefined>(undefined);

  // Show success dialog with options
  const displaySuccess = useCallback((options: string | DialogOptions) => {
    if (typeof options === 'string') {
      setSuccessMessage(options);
      setSuccessTitle("สำเร็จ");
      setSuccessButtonText("ตกลง");
      setOnSuccessButtonClick(undefined);
    } else {
      setSuccessMessage(options.message);
      if (options.title) setSuccessTitle(options.title);
      if (options.buttonText) setSuccessButtonText(options.buttonText);
      if (options.onButtonClick) setOnSuccessButtonClick(() => options.onButtonClick);
    }
    setShowSuccessDialog(true);
  }, []);

  // Show error dialog with options
  const displayError = useCallback((options: string | DialogOptions) => {
    if (typeof options === 'string') {
      setErrorMessage(options);
      setErrorTitle("เกิดข้อผิดพลาด");
      setErrorButtonText("ปิด");
      setOnErrorButtonClick(undefined);
    } else {
      setErrorMessage(options.message);
      if (options.title) setErrorTitle(options.title);
      if (options.buttonText) setErrorButtonText(options.buttonText);
      if (options.onButtonClick) setOnErrorButtonClick(() => options.onButtonClick);
    }
    setShowErrorDialog(true);
  }, []);

  // Close success dialog
  const closeSuccessDialog = useCallback(() => {
    // First close the dialog
    setShowSuccessDialog(false);
    
    // Then execute the callback after a short delay to prevent loops
    if (onSuccessButtonClick) {
      const callback = onSuccessButtonClick;
      // Clear the callback before executing it to prevent potential loops
      setOnSuccessButtonClick(undefined);
      
      // Use setTimeout to ensure the dialog is fully closed before executing callback
      setTimeout(() => {
        callback();
      }, 100);
    }
  }, [onSuccessButtonClick]);

  // Close error dialog
  const closeErrorDialog = useCallback(() => {
    // First close the dialog
    setShowErrorDialog(false);
    
    // Then execute the callback after a short delay to prevent loops
    if (onErrorButtonClick) {
      const callback = onErrorButtonClick;
      // Clear the callback before executing it to prevent potential loops
      setOnErrorButtonClick(undefined);
      
      // Use setTimeout to ensure the dialog is fully closed before executing callback
      setTimeout(() => {
        callback();
      }, 100);
    }
  }, [onErrorButtonClick]);

  return {
    // Success dialog props
    showSuccessDialog,
    setShowSuccessDialog,
    successMessage,
    successTitle,
    successButtonText,
    // Error dialog props
    showErrorDialog,
    setShowErrorDialog,
    errorMessage,
    errorTitle,
    errorButtonText,
    // Methods
    displaySuccessDialog: displaySuccess,
    displayErrorDialog: displayError,
    handleSuccessClose: closeSuccessDialog,
    handleErrorClose: closeErrorDialog,
  };
} 