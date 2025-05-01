import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEnvelope, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import { OtpModalProps } from '@/types/profile';

const OtpModal: React.FC<OtpModalProps> = ({
  email,
  otpValues,
  inputRefs,
  error,
  isVerifying,
  isSendingOtp,
  otpSent,
  onOtpChange,
  onKeyDown,
  onVerify,
  onClose,
  onSendOtp
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
            </button>
          </div>
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">ยืนยันอีเมลใหม่</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  กรุณากรอกรหัส OTP ที่ส่งไปยัง <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                  {error}
                </div>
              )}

              <div className="mt-6">
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      ref={inputRefs[index]}
                      value={otpValues[index]}
                      onChange={(e) => onOtpChange(index, e.target.value)}
                      onKeyDown={(e) => onKeyDown(index, e)}
                      className="w-full h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isVerifying}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={onVerify}
                  disabled={isVerifying || otpValues.some(v => !v)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 h-4 w-4" />
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    'ยืนยัน OTP'
                  )}
                </button>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={onSendOtp}
                    disabled={isSendingOtp}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingOtp ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 h-4 w-4" />
                        กำลังส่ง...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 h-4 w-4" />
                        ส่ง OTP
                      </>
                    )}
                  </button>
                ) : (
                  <div className="mt-3 w-full inline-flex items-center sm:mt-0 sm:w-auto text-sm text-green-600">
                    <FontAwesomeIcon icon={faCheck} className="mr-2 h-4 w-4" />
                    ส่ง OTP เรียบร้อยแล้ว
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpModal; 