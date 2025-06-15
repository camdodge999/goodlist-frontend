import { useState, useCallback } from 'react';

interface DialogOptions {
  title?: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function useShowDialog() {
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [successTitle, setSuccessTitle] = useState<string>("สำเร็จ");
  const [errorTitle, setErrorTitle] = useState<string>("เกิดข้อผิดพลาด");
  const [confirmTitle, setConfirmTitle] = useState<string>("ยืนยัน");
  const [successButtonText, setSuccessButtonText] = useState<string>("ตกลง");
  const [errorButtonText, setErrorButtonText] = useState<string>("ปิด");
  const [confirmButtonText, setConfirmButtonText] = useState<string>("ใช่");
  const [cancelButtonText, setCancelButtonText] = useState<string>("ไม่");
  const [onSuccessButtonClick, setOnSuccessButtonClick] = useState<(() => void) | undefined>(undefined);
  const [onErrorButtonClick, setOnErrorButtonClick] = useState<(() => void) | undefined>(undefined);
  const [onConfirmButtonClick, setOnConfirmButtonClick] = useState<(() => void) | undefined>(undefined);
  const [onCancelButtonClick, setOnCancelButtonClick] = useState<(() => void) | undefined>(undefined);

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

  // Show confirmation dialog with options
  const displayConfirm = useCallback((options: string | ConfirmDialogOptions) => {
    if (typeof options === 'string') {
      setConfirmMessage(options);
      setConfirmTitle("ยืนยัน");
      setConfirmButtonText("ใช่");
      setCancelButtonText("ไม่");
      setOnConfirmButtonClick(undefined);
      setOnCancelButtonClick(undefined);
    } else {
      setConfirmMessage(options.message);
      if (options.title) setConfirmTitle(options.title);
      if (options.confirmText) setConfirmButtonText(options.confirmText);
      if (options.cancelText) setCancelButtonText(options.cancelText);
      if (options.onConfirm) setOnConfirmButtonClick(() => options.onConfirm);
      if (options.onCancel) setOnCancelButtonClick(() => options.onCancel);
    }
    setShowConfirmDialog(true);
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

  // Handle confirm button click
  const handleConfirm = useCallback(() => {
    // First close the dialog
    setShowConfirmDialog(false);
    
    // Then execute the callback after a short delay to prevent loops
    if (onConfirmButtonClick) {
      const callback = onConfirmButtonClick;
      // Clear the callback before executing it to prevent potential loops
      setOnConfirmButtonClick(undefined);
      setOnCancelButtonClick(undefined);
      
      // Use setTimeout to ensure the dialog is fully closed before executing callback
      setTimeout(() => {
        callback();
      }, 100);
    }
  }, [onConfirmButtonClick]);

  // Handle cancel button click
  const handleCancel = useCallback(() => {
    // First close the dialog
    setShowConfirmDialog(false);
    
    // Then execute the callback after a short delay to prevent loops
    if (onCancelButtonClick) {
      const callback = onCancelButtonClick;
      // Clear the callback before executing it to prevent potential loops
      setOnConfirmButtonClick(undefined);
      setOnCancelButtonClick(undefined);
      
      // Use setTimeout to ensure the dialog is fully closed before executing callback
      setTimeout(() => {
        callback();
      }, 100);
    }
  }, [onCancelButtonClick]);

  return {
    // Success dialog props
    showSuccessDialog,
    setShowSuccessDialog,
    successMessage,
    successTitle,
    successButtonText,
    onSuccessButtonClick,
    // Error dialog props
    showErrorDialog,
    setShowErrorDialog,
    errorMessage,
    errorTitle,
    errorButtonText,
    onErrorButtonClick,
    // Confirmation dialog props
    showConfirmDialog,
    setShowConfirmDialog,
    confirmMessage,
    confirmTitle,
    confirmButtonText,
    cancelButtonText,
    onConfirmButtonClick,
    onCancelButtonClick,
    // Methods
    displaySuccessDialog: displaySuccess,
    displayErrorDialog: displayError,
    displayConfirmDialog: displayConfirm,
    handleSuccessClose: closeSuccessDialog,
    handleErrorClose: closeErrorDialog,
    handleConfirmClick: handleConfirm,
    handleCancelClick: handleCancel,
  };
} 