import { useState } from 'react';

interface DialogOptions {
  title?: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function useShowDialog() {
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
  const displaySuccess = (options: string | DialogOptions) => {
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
  };

  // Show error dialog with options
  const displayError = (options: string | DialogOptions) => {
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
  };

  // Close success dialog
  const closeSuccessDialog = () => {
    setShowSuccessDialog(false);
    if (onSuccessButtonClick) {
      onSuccessButtonClick();
    }
  };

  // Close error dialog
  const closeErrorDialog = () => {
    setShowErrorDialog(false);
    if (onErrorButtonClick) {
      onErrorButtonClick();
    }
  };

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