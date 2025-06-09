import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import defaultImage from '@images/logo.webp';

interface DocumentPreviewDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly imageUrl: string;
  readonly documentName?: string;
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
        <DialogHeader className="space-y-6">
          <DialogTitle className="hidden">
            <span className="text-lg font-semibold mb-4">{documentName || 'เอกสาร'}</span>
          </DialogTitle>
          <DialogDescription className="hidden">{documentName}</DialogDescription>
        </DialogHeader>
        <div className="relative p-4">
          <div className="relative w-full h-[70vh]">
            <Image
              style={{
                color: undefined, // This is required to prevent the inline style of `next/image`
              }}
              src={imageUrl || defaultImage.src}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = defaultImage.src;
              }}
              alt={documentName ?? 'Document preview'}  
              fill
              className="object-contain max-h-[70vh]"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewDialog; 