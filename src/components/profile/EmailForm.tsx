import React, { useState, FormEvent, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form-label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import OtpModal from "./OtpModal";
dayjs.extend(buddhistEra);
dayjs.locale('th');

interface EmailFormProps {
    currentEmail: string;
    lastEmailChange: Date | null;
    canChangeEmail: boolean;
    isEditing: boolean;
    emailError: string;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeEmail: (newEmail: string, currentPassword: string) => Promise<boolean>;
}

export default function EmailForm({
    currentEmail,
    lastEmailChange,
    canChangeEmail,
    isEditing,
    emailError,
    onEmailChange,
    onChangeEmail
}: EmailFormProps) {
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // OTP Modal states
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [pendingEmailChange, setPendingEmailChange] = useState<{email: string, password: string} | null>(null);

    // Create individual refs for each OTP input
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    // Initialize refs
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
        while (inputRefs.current.length < 6) {
            inputRefs.current.push(null);
        }
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newEmail || !currentPassword) {
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Store the email change request for OTP verification
            setPendingEmailChange({ email: newEmail, password: currentPassword });
            
            // Show OTP modal instead of directly changing email
            setShowOtpModal(true);
            setOtpSent(false);
            setOtpError("");
            setOtpValues(["", "", "", "", "", ""]);
        } catch (error) {
            console.error("Error initiating email change:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedValues = value.split("").slice(0, 6);
            const newOtpValues = [...otpValues];
            pastedValues.forEach((val, i) => {
                if (i < 6) {
                    newOtpValues[i] = val;
                }
            });
            setOtpValues(newOtpValues);

            // Focus the last input
            const lastInputIndex = Math.min(pastedValues.length - 1, 5);
            if (inputRefs.current[lastInputIndex]) {
                inputRefs.current[lastInputIndex]?.focus();
            }
            return;
        }

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);

        // Auto-focus next input
        if (value && index < 5) {
            if (inputRefs.current[index + 1]) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            // Move to previous input on backspace
            if (inputRefs.current[index - 1]) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleSendOtp = async () => {
        setIsSendingOtp(true);
        setOtpError("");

        try {
            // Simulate API call to send OTP for email change
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setOtpSent(true);
        } catch {
            setOtpError("เกิดข้อผิดพลาดในการส่ง OTP กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otp = otpValues.join("");
        
        if (otp.length !== 6) {
            setOtpError("กรุณากรอก OTP ให้ครบ 6 หลัก");
            return;
        }

        if (otp !== "000000") {
            setOtpError("OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
            return;
        }

        setIsVerifying(true);
        setOtpError("");

        try {
            if (pendingEmailChange) {
                // Now actually change the email after OTP verification
                const success = await onChangeEmail(pendingEmailChange.email, pendingEmailChange.password);
                if (success) {
                    setNewEmail("");
                    setCurrentPassword("");
                    setPendingEmailChange(null);
                    setShowOtpModal(false);
                    setOtpValues(["", "", "", "", "", ""]);
                    setOtpSent(false);
                }
            }
        } catch {
            setOtpError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCloseOtpModal = () => {
        setShowOtpModal(false);
        setOtpValues(["", "", "", "", "", ""]);
        setOtpSent(false);
        setOtpError("");
        setPendingEmailChange(null);
    };

    if (!isEditing) {
        return null;
    }

    return (
        <>
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">เปลี่ยนอีเมล</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <FormLabel
                                    htmlFor="currentEmail"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    อีเมลปัจจุบัน
                                </FormLabel>
                                <Input
                                    type="email"
                                    id="currentEmail"
                                    name="currentEmail"
                                    className="mt-1"
                                    disabled={true}
                                    value={currentEmail}
                                />
                                {!canChangeEmail && lastEmailChange && (
                                    <div className="mt-1 text-xs text-gray-500">
                                        <span>คุณได้เปลี่ยนอีเมลล่าสุดเมื่อวันที่{" "}</span>
                                        <span>{dayjs(lastEmailChange).format('DD/MM/BBBB')}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <FormLabel
                                    htmlFor="newEmail"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    อีเมลใหม่
                                </FormLabel>
                                <Input
                                    type="email"
                                    id="newEmail"
                                    name="newEmail"
                                    className="mt-1"
                                    value={newEmail}
                                    onChange={(e) => {
                                        setNewEmail(e.target.value);
                                        onEmailChange(e);
                                    }}
                                    placeholder="กรอกอีเมลใหม่"
                                    disabled={!canChangeEmail}
                                />
                                {emailError && (
                                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                                )}
                            </div>

                            <div>
                                <FormLabel
                                    htmlFor="currentPassword"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    รหัสผ่านปัจจุบัน
                                </FormLabel>
                                <Input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    className="mt-1"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                                    disabled={!canChangeEmail}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={!canChangeEmail || !newEmail || !currentPassword || isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "กำลังเปลี่ยน..." : "เปลี่ยนอีเมล"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <OtpModal
                    email={newEmail}
                    otpValues={otpValues}
                    error={otpError}
                    isVerifying={isVerifying}
                    isSendingOtp={isSendingOtp}
                    otpSent={otpSent}
                    onOtpChange={handleOtpChange}
                    onKeyDown={handleKeyDown}
                    onVerify={handleVerifyOtp}
                    onClose={handleCloseOtpModal}
                    onSendOtp={handleSendOtp}
                />
            )}
        </>
    );
} 