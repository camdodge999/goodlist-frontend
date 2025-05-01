import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faCommentDots, faPhone, faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactInfo, User } from "@/types/stores";

interface ContactInfoCardProps {
  contactInfo: ContactInfo;
  userEmail: string;
  isLoggedIn: boolean;
}

export default function ContactInfoCard({ contactInfo, userEmail, isLoggedIn }: ContactInfoCardProps) {
  return (
    <Card className="p-5 border border-gray-100 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        ข้อมูลการติดต่อ
      </h2>
      <dl className="space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500 flex items-center">
            <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 mr-2 text-gray-400" />
            อีเมล
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {userEmail}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500 flex items-center">
            <FontAwesomeIcon icon={faCommentDots} className="w-4 h-4 mr-2 text-gray-400" />
            ช่องทางการติดต่อ
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Line: {contactInfo.line}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Facebook: {contactInfo.facebook}
              </Badge>
            </div>
          </dd>
        </div>

        {isLoggedIn && (
          <div>
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faPhone} className="w-4 h-4 mr-2 text-gray-400" />
              เบอร์โทรศัพท์
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {contactInfo.phone}
            </dd>
          </div>
        )}

        {isLoggedIn && (
          <div>
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faMapMarker} className="w-4 h-4 mr-2 text-gray-400" />
              ที่อยู่
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {contactInfo.address}
            </dd>
          </div>
        )}
      </dl>
    </Card>
  );
} 