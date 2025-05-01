"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faXmark, 
  faCircleCheck, 
  faFileLines 
} from '@fortawesome/free-solid-svg-icons';
import type { VerificationBadgeProps, BadgeProps } from '@/types/verification';

export default function VerificationBadge({ status, customText }: VerificationBadgeProps): React.ReactElement {
  const getBadgeProps = (): BadgeProps => {
    switch (status) {
      case "verified":
        return {
          icon: faCircleCheck,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          text: "ผ่านการตรวจสอบ",
        };
      case "pending":
        return {
          icon: faClock,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          text: "รอการตรวจสอบ",
        };
      case "banned":
        return {
          icon: faXmark,
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          text: "ถูกแบน",
        };
      case "not_started":
        return {
          icon: faFileLines,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          text: customText || "ยังไม่ได้ส่งเอกสาร",
        };
      default:
        return {
          icon: faFileLines,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          text: "ยังไม่ได้ส่งเอกสาร",
        };
    }
  };

  const { icon, bgColor, textColor, text } = getBadgeProps();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}
    >
      <FontAwesomeIcon icon={icon} className="h-4 w-4" />
      {text}
    </span>
  );
} 