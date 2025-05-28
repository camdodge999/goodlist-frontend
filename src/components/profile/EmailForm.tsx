import React, { useState, FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form-label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import duration from 'dayjs/plugin/duration';
import { UserResponse } from "@/types/users";
import Spinner from "@/components/ui/Spinner";
import { useUser } from "@/contexts/UserContext";
import { emailChangeSchema, type EmailChangeSchema } from "@/validators/profile.schema";
import { ZodError } from "zod";
dayjs.extend(buddhistEra);
dayjs.extend(duration);
dayjs.locale('th');

interface EmailFormProps {
    currentEmail: string;
    lastEmailChange: Date | null;
    canChangeEmail: boolean;
    isEditing: boolean;
    emailError: string;
    emailCooldownSeconds?: number;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEmailChangeSuccess?: (responseData: { data: UserResponse }, emailData: {email: string, password: string}) => void;
    onEmailChangeError?: (error: string) => void;
    shouldResetForm?: boolean;
    onFormReset?: () => void;
    userId: string;
}

export default function EmailForm({
    currentEmail,
    lastEmailChange,
    canChangeEmail,
    isEditing,
    emailError,
    emailCooldownSeconds,
    onEmailChange,
    onEmailChangeSuccess,
    onEmailChangeError,
    shouldResetForm,
    onFormReset,
    userId
}: EmailFormProps) {
    const { changeUserEmail } = useUser();
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Validation states
    const [validationErrors, setValidationErrors] = useState<Partial<EmailChangeSchema>>({});
    const [isValid, setIsValid] = useState(false);

    // Validate form data
    const validateForm = (data: EmailChangeSchema) => {
        try {
            emailChangeSchema.parse(data);
            setValidationErrors({});
            setIsValid(true);
            return true;
        } catch (error) {
            if (error instanceof Error && 'errors' in error) {
                const zodError = error as unknown as ZodError;
                const errors: Partial<EmailChangeSchema> = {};
                zodError.errors.forEach((err) => {
                    if (err.path[0]) {
                        errors[err.path[0] as keyof EmailChangeSchema] = err.message;
                    }
                });
                setValidationErrors(errors);
            }
            setIsValid(false);
            return false;
        }
    };

    // Validate on input change
    useEffect(() => {
        if (newEmail || currentPassword) {
            validateForm({ newEmail, currentPassword });
        } else {
            setValidationErrors({});
            setIsValid(false);
        }
    }, [newEmail, currentPassword]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate form before submission
        const formData = { newEmail, currentPassword };
        if (!validateForm(formData)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await changeUserEmail({
                userId: userId,
                email: currentEmail,
                newEmail: newEmail,
                password: currentPassword
            });

            if (result) {
                // Don't reset form fields here - keep them until OTP verification is complete
                // Only clear the password field for security
                setCurrentPassword("");

                // Call the success handler if provided
                if (onEmailChangeSuccess) {
                    // The result from changeUserEmail is actually UserResponse, so we wrap it properly
                    onEmailChangeSuccess({ data: result as unknown as UserResponse }, { email: newEmail, password: currentPassword });
                }
            }
        } catch (error) {
            console.error("Error changing email:", error);
            
            // Call the error handler if provided
            if (onEmailChangeError) {
                onEmailChangeError(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเปลี่ยนอีเมล");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add a function to reset the form when OTP verification is successful
    const resetForm = () => {
        setNewEmail("");
        setCurrentPassword("");
        setValidationErrors({});
        setIsValid(false);
    };

    useEffect(() => {
        if (shouldResetForm) {
            resetForm();
            // Notify parent that form has been reset
            if (onFormReset) {
                onFormReset();
            }
        }
    }, [shouldResetForm, onFormReset]);

    if (!isEditing) {
        return null;
    }

    return (
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
                            {validationErrors.newEmail && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.newEmail}</p>
                            )}
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
                            {validationErrors.currentPassword && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.currentPassword}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!canChangeEmail || !isValid || isSubmitting || (emailCooldownSeconds || 0) > 0}
                                className="flex items-center gap-2"
                            >
                                {emailCooldownSeconds && emailCooldownSeconds > 0 ? (
                                    <span>รอเปลี่ยนอีเมล... ({dayjs.duration(emailCooldownSeconds, 'seconds').format('mm:ss')})</span>
                                ) : (
                                    <>
                                        {isSubmitting && <Spinner />}
                                        {isSubmitting ? "กำลังเปลี่ยน..." : "เปลี่ยนอีเมล"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
} 