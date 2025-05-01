import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { ResetPasswordFormProps } from '@/types/auth';

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  error,
  isLoading,
  onEmailChange,
  onSubmit
}) => {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon 
                icon={faExclamationCircle} 
                className="h-5 w-5 text-red-400" 
                aria-hidden="true" 
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="sr-only">
          อีเมล
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="อีเมล"
            value={email}
            onChange={onEmailChange}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <FontAwesomeIcon
                icon={faSpinner}
                className="animate-spin h-5 w-5 text-white"
                aria-hidden="true"
              />
            </span>
          ) : null}
          {isLoading ? "กำลังส่งอีเมล..." : "ส่งอีเมลรีเซ็ตรหัสผ่าน"}
        </button>
      </div>

      <div className="text-sm text-center">
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </form>
  );
};

export default ResetPasswordForm; 