import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { User } from '@/types/users';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage';

interface ProfileHeaderProps {
  user: User;
  onLogout: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onLogout }) => {
  const { authenticatedUrl: imageUrl } = useAuthenticatedImage(user.logo_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24 transition-transform duration-300 group-hover:scale-110 cursor-pointer">
              <AvatarImage
                src={imageUrl || undefined}
                alt={user.displayName || "User"}
                className="transition-opacity duration-300"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-medium text-4xl">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.displayName}
              </h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{user.email}</span>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faPhone} className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{user.phoneNumber || 'ไม่ระบุ'}</span>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{user.address || 'ไม่ระบุ'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader; 