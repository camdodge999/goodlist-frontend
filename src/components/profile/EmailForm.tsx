import React, { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form-label";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
dayjs.extend(buddhistEra);
dayjs.locale('th');

interface EmailFormProps {
    currentEmail: string;
    lastEmailChange: Date | null;
    canChangeEmail: boolean;
    isEditing: boolean;
    emailError: string;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeEmail: (newEmail: string) => Promise<boolean>;
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newEmail) {
            return;
        }
        
        try {
            await onChangeEmail(newEmail);
            setNewEmail("");
        } catch (error) {
            console.error("Error changing email:", error);
        }
    };


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

                        {isEditing && (
                            <>
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
                                    />
                                    {emailError && (
                                        <p className="mt-1 text-sm text-red-600">{emailError}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
} 