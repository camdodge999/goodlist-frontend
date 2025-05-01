import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { User } from '@/types/profile';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
  user: User;
  previewImage: string | null;
  onLogout: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, previewImage, onLogout }) => {
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
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
              {previewImage || user.profile_image ? (
                <Image
                  src={previewImage || user.profile_image}
                  alt={`รูปโปรไฟล์ของ ${user.name}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <FontAwesomeIcon icon={faUser} className="h-full w-full p-4 text-gray-300" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name}
              </h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </button>
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
            <span className="text-sm text-gray-900">{user.phone || 'ไม่ระบุ'}</span>
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