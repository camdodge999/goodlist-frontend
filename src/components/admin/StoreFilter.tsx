import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { faFilter, faSearch, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Store } from '@/types/stores';

export type VerificationFilter = 'all' | 'approved' | 'rejected';

interface StoreFilterProps {
    activeFilter: VerificationFilter;
    stores: Store[];
    onFilterChange: (filter: VerificationFilter) => void;
    activeTab: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function StoreFilter({ activeFilter, onFilterChange, stores, searchQuery, onSearchChange, activeTab }: StoreFilterProps) {
    const verifiedStores = stores.filter((store) => store.isVerified === true).length;
    const rejectedStores = stores.filter((store) => store.isVerified === false).length;


    const handleFilterChangeAll = () => {
        onFilterChange('all');
    };

    const handleFilterChangeApproved = () => {
        onFilterChange('approved');
    };

    const handleFilterChangeRejected = () => {
        onFilterChange('rejected');
    };

    return (
        <div className="flex flex-col gap-4 mb-4">
            {/* Search Input */}
            <div className="flex flex-row items-center gap-2">
                <div className="flex-1 max-w-md relative">
                    <FontAwesomeIcon icon={faSearch} className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-500" />
                    <Input
                        type="text"
                        placeholder="ค้นหาชื่อร้านค้า..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-8"
                    />
                    {searchQuery && (
                        <FontAwesomeIcon icon={faXmark} className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:text-red-500" onClick={() => onSearchChange('')} />
                    )}
                </div>
            </div>
            {activeTab === 'verified' && (
                <div className="flex flex-row items-center gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">ตัวกรอง : </span>
                    </div>
                    <div className="flex gap-2 ">
                        <Button
                            variant={activeFilter === 'all' ? 'default' : 'outline'}
                            onClick={handleFilterChangeAll}
                            size="sm"
                        >
                            <span>ทั้งหมด</span>
                        </Button>
                        <Button
                            variant={activeFilter === 'approved' ? 'default' : 'outline'}
                            onClick={handleFilterChangeApproved}
                            size="sm"
                            className={activeFilter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            <span>อนุมัติ ({verifiedStores})</span>
                        </Button>
                        <Button
                            variant={activeFilter === 'rejected' ? 'default' : 'outline'}
                            onClick={handleFilterChangeRejected}
                            size="sm"
                            className={activeFilter === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            <span>ปฏิเสธ ({rejectedStores})</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
} 