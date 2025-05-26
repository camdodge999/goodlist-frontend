import { Tab } from "@/types/tabs";
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

interface UnderlineTabProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function UnderlineTab({ tabs, activeTab, onTabChange }: UnderlineTabProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Get active tab info
  const activeTabInfo = tabs.find(tab => tab.id === activeTab);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  // Handle tab selection
  const handleTabSelect = (tabId: string) => {
    onTabChange(tabId);
    setIsMenuOpen(false);
  };

  return (
    <div className="border-b border-gray-200">
      {/* Mobile Hamburger Menu */}
      <div className="md:hidden relative" ref={menuRef}>
        {/* Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {activeTabInfo?.name || 'Select Tab'}
            </span>
            {activeTabInfo && (activeTabInfo.count || activeTabInfo.count === 0) && (
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {activeTabInfo.count}
              </span>
            )}
          </div>
          <FontAwesomeIcon 
            icon={isMenuOpen ? faTimes : faBars} 
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isMenuOpen ? 'rotate-90' : 'rotate-0'
            }`}
          />
        </button>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <>
            
            {/* Menu */}
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 animate-fade-in-up">
              <div className="py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200
                      ${activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500"
                        : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <span className="text-sm font-medium">{tab.name}</span>
                    {(tab.count || tab.count === 0) && (
                      <span className={`
                        py-0.5 px-2 rounded-full text-xs
                        ${activeTab === tab.id
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                        }
                      `}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Horizontal Tabs */}
      <nav className="hidden md:flex -mb-px space-x-4 overflow-x-auto scrollbar-hide" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm text-center cursor-pointer transition-colors duration-200 flex-shrink-0
              ${activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <span>{tab.name}</span>
            {(tab.count || tab.count === 0) && ( 
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs inline-block">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
} 