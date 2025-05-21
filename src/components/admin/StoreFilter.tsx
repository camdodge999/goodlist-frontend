import React from 'react';
import { Button } from "@/components/ui/button";
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type VerificationFilter = 'all' | 'approved' | 'rejected';

interface StoreFilterProps {
    activeFilter: VerificationFilter;
    onFilterChange: (filter: VerificationFilter) => void;
}

export default function StoreFilter({ activeFilter, onFilterChange }: StoreFilterProps) {
    return (
        <div className="flex flex-row items-center gap-2 mb-4">
            <div className="flex flex-row items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">ตัวกรอง : </span>
            </div>
            <div className="flex gap-2 ">
                <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => onFilterChange('all')}
                    size="sm"
                >
                    ทั้งหมด
                </Button>
                <Button
                    variant={activeFilter === 'approved' ? 'default' : 'outline'}
                    onClick={() => onFilterChange('approved')}
                    size="sm"
                    className={activeFilter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                    อนุมัติ
                </Button>
                <Button
                    variant={activeFilter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => onFilterChange('rejected')}
                    size="sm"
                    className={activeFilter === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                    ปฏิเสธ
                </Button>
            </div>
        </div>
    );
} 