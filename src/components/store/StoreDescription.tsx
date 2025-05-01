import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileText } from '@fortawesome/free-solid-svg-icons';

interface StoreDescriptionProps {
  description: string;
}

export default function StoreDescription({ description }: StoreDescriptionProps) {
  if (!description) return null;

  return (
    <div className="px-6 py-4 sm:px-8 border-t border-gray-200">
      <div className="flex items-start gap-2">
        <FontAwesomeIcon icon={faFileText} className="w-5 h-5 text-gray-400 mt-0.5" />
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
} 