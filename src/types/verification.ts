import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type VerificationStatus = 'verified' | 'pending' | 'banned' | 'not_started';

export interface VerificationBadgeProps {
  status: VerificationStatus;
  customText?: string;
}

export interface BadgeProps {
  icon: IconDefinition;
  bgColor: string;
  textColor: string;
  text: string;
} 