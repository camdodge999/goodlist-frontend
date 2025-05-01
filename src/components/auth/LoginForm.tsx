"use client";

import { useState, FormEvent, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { loginSchema } from "@/validators/user.schema";
import { ZodError } from "zod";

export default function LoginForm(): JSX.Element {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateForm = (): boolean => {
    try {
      loginSchema.parse({ email, password });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as string] = error.message;
          }
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/profile");
      } else {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (_) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl"
    >
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center text-3xl font-extrabold text-gray-900"
        >
          เข้าสู่ระบบ
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-center text-sm text-gray-600"
        >
          หรือ{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            สมัครสมาชิก
          </Link>
        </motion.p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="email" className="sr-only">
              อีเมล
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`appearance-none relative block w-full px-3 py-2.5 border-0 bg-white/50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 sm:text-sm ${
                fieldErrors.email ? "ring-2 ring-red-500" : ""
              }`}
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="password" className="sr-only">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={`appearance-none relative block w-full px-3 py-2.5 border-0 bg-white/50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 sm:text-sm ${
                fieldErrors.password ? "ring-2 ring-red-500" : ""
              }`}
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
            )}
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            ) : null}
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
} 