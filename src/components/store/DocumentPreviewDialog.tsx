import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import defaultImage from '@images/logo.webp';

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  documentName?: string;
}

const DocumentPreviewDialog: React.FC<DocumentPreviewDialogProps> = ({ 
  isOpen, 
  onClose, 
  imageUrl,
  documentName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-y-auto max-h-[90vh]">
        <div className="relative p-4">
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 z-10"
          >
            <X size={20} />
          </button>
          <h3 className="text-lg font-semibold mb-4">{documentName || 'เอกสาร'}</h3>
          <div className="relative w-full h-[70vh]">
            <Image
              src={imageUrl}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = defaultImage.src;
              }}
              alt={documentName || 'Document preview'}
              fill
              className="object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewDialog; 