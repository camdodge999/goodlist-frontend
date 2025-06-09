import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faCommentDots, faPhone, faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactInfo } from "@/types/stores";
import { isValidJSON } from "@/utils/valid-json";

interface ContactInfoCardProps {
  readonly contactInfo: ContactInfo | string;  
  readonly userEmail: string;
}

export default function ContactInfoCard({ contactInfo, userEmail }: ContactInfoCardProps) {
  // Parse contactInfo if it's a string and valid JSON
  let contactData: ContactInfo | string = contactInfo;
  
  if (typeof contactInfo === 'string') {
    if (isValidJSON(contactInfo)) {
      try {
        contactData = JSON.parse(contactInfo) as ContactInfo;
      } catch {
        // Keep as string if parsing fails
      }
    }
    // If not valid JSON, keep as string
  }

  return (
    <Card className="p-5 border border-gray-100 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        ข้อมูลการติดต่อ
      </h2>
      <dl className="space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500 flex items-center">
            <FontAwesomeIcon icon={faGlobe} className="mr-2 text-gray-400" />
            <span>อีเมล</span>
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {userEmail}
          </dd>
        </div>

        {typeof contactData !== 'string' && (
          <div>
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-gray-400" />
              <span>ช่องทางการติดต่อ</span>
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {contactData.line && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Line: {contactData.line}
                  </Badge>
                </div>
              )}
              {contactData.facebook && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Facebook: {contactData.facebook}
                  </Badge>
                </div>
              )}
            </dd>
          </div>
        )}

        {typeof contactData === 'string' && (
          <div>
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faCommentDots} className="w-4 h-4 mr-2 text-gray-400" />
              ข้อมูลการติดต่อ
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              <pre className="whitespace-pre-wrap">{contactData}</pre>
            </dd>
          </div>
        )}

        <div>
          <dt className="text-sm font-medium text-gray-500 flex items-center">
            <FontAwesomeIcon icon={faPhone} className="w-4 h-4 mr-2 text-gray-400" />
            เบอร์โทรศัพท์
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {(contactData as unknown as ContactInfo)?.phone || "ไม่มีข้อมูล"}
          </dd>
        </div>

        {typeof contactData !== 'string' && contactData.address && (
          <div>
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faMapMarker} className="w-4 h-4 mr-2 text-gray-400" />
              ที่อยู่
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {contactData.address}
            </dd>
          </div>
        )}
      </dl>
    </Card>
  );
} 