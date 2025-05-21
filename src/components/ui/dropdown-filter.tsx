import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { AnimatePresence, motion } from "framer-motion";

export interface DropdownFilterProps<T> {
  items: T[];
  selectedItem: T | null;
  onSelectItem: (item: T) => void;
  filterFunction: (item: T, query: string) => boolean;
  renderItem: (item: T, isHighlighted: boolean, isSelected: boolean) => React.ReactNode;
  getItemId: (item: T) => string | number;
  placeholder?: string;
  validationError?: string;
  noResultsMessage?: string;
  className?: string;
  tabNavigatesItems?: boolean;
}

export function DropdownFilter<T>({
  items,
  selectedItem,
  onSelectItem,
  filterFunction,
  renderItem,
  getItemId,
  placeholder = "Search...",
  validationError,
  noResultsMessage = "No results found",
  className,
  tabNavigatesItems = true
}: DropdownFilterProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  
  // Key repeat handling
  const keyDownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const keyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentKeyRef = useRef<string | null>(null);
  const initialRepeatDelayMs = 500; // Initial delay before key repeat starts
  const repeatIntervalMs = 100;     // Interval between repeated actions

  // Filter items based on search query
  const filteredItems = items.filter(item => filterFunction(item, searchQuery));

  // Reset refs array when filtered items change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredItems.length);
  }, [filteredItems]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [highlightedIndex]);

  // Clean up key repeat timers on unmount
  useEffect(() => {
    return () => {
      if (keyDownTimeoutRef.current) clearTimeout(keyDownTimeoutRef.current);
      if (keyIntervalRef.current) clearInterval(keyIntervalRef.current);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when dropdown closes
  useEffect(() => {
    if (!isDropdownOpen) {
      setHighlightedIndex(-1);
    }
  }, [isDropdownOpen]);

  // Handle key action based on key name
  const handleKeyAction = (key: string) => {
    if (filteredItems.length === 0) return;

    switch (key) {
      case "ArrowDown":
      case "Tab": // Handle Tab like ArrowDown
        setHighlightedIndex((prev) => {
          return prev < filteredItems.length - 1 ? prev + 1 : 0; // Loop back to top
        });
        break;
      case "ArrowUp":
      case "ShiftTab": // Handle Shift+Tab like ArrowUp
        setHighlightedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredItems.length - 1 // Loop back to bottom
        );
        break;
      case "Home":
        setHighlightedIndex(0);
        break;
      case "End":
        setHighlightedIndex(filteredItems.length - 1);
        break;
      case "PageDown":
        setHighlightedIndex((prev) => {
          const nextIndex = Math.min(prev + 5, filteredItems.length - 1);
          return nextIndex;
        });
        break;
      case "PageUp":
        setHighlightedIndex((prev) => Math.max(prev - 5, 0));
        break;
    }
  };

  // Setup key repeat
  const setupKeyRepeat = (key: string) => {
    // Clear any existing timers
    if (keyDownTimeoutRef.current) clearTimeout(keyDownTimeoutRef.current);
    if (keyIntervalRef.current) clearInterval(keyIntervalRef.current);
    
    // Store current key
    currentKeyRef.current = key;
    
    // Execute action immediately
    handleKeyAction(key);
    
    // Set initial delay before starting repeat
    keyDownTimeoutRef.current = setTimeout(() => {
      // Start repeating the action
      keyIntervalRef.current = setInterval(() => {
        if (currentKeyRef.current === key) {
          handleKeyAction(key);
        }
      }, repeatIntervalMs);
    }, initialRepeatDelayMs);
  };

  // Clear key repeat
  const clearKeyRepeat = () => {
    if (keyDownTimeoutRef.current) clearTimeout(keyDownTimeoutRef.current);
    if (keyIntervalRef.current) clearInterval(keyIntervalRef.current);
    currentKeyRef.current = null;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle dropdown open/close
    if (e.key === "ArrowDown" && !isDropdownOpen) {
      e.preventDefault();
      setIsDropdownOpen(true);
      return;
    }

    if (!isDropdownOpen) return;

    // Handle special keys that shouldn't repeat
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          onSelectItem(filteredItems[highlightedIndex]);
          setIsDropdownOpen(false);
          inputRef.current?.focus();
        }
        return;
      case "Escape":
        e.preventDefault();
        setIsDropdownOpen(false);
        inputRef.current?.focus();
        return;
      case "Tab":
        if (tabNavigatesItems) {
          e.preventDefault();
          if (e.shiftKey) {
            // Shift+Tab - move up
            handleKeyAction("ShiftTab");
          } else {
            // Tab - move down
            handleKeyAction("Tab");
          }
          return;
        }
        // If tabNavigatesItems is false, let Tab handle normal navigation
        setIsDropdownOpen(false);
        return;
    }

    // Handle navigation keys with repeat
    const navigationKeys = ["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"];
    if (navigationKeys.includes(e.key)) {
      e.preventDefault();
      setupKeyRepeat(e.key);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    const navigationKeys = ["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"];
    if (navigationKeys.includes(e.key)) {
      clearKeyRepeat();
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
    if (!isDropdownOpen) {
      // Focus the input when opening
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Handle item click
  const handleItemClick = (item: T) => {
    onSelectItem(item);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  // Focus an item directly
  const focusItem = (index: number) => {
    if (index >= 0 && index < filteredItems.length) {
      setHighlightedIndex(index);
      if (itemRefs.current[index]) {
        itemRefs.current[index]?.focus();
      }
    }
  };

  // Generate a unique ID for ARIA attributes
  const dropdownId = useRef(`dropdown-filter-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          className={cn("pl-10 pr-8", validationError && "border-red-300 focus-visible:ring-red-500")}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          aria-expanded={isDropdownOpen}
          aria-controls={dropdownId.current}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="absolute inset-y-0 left-0 flex items-center gap-1 pl-3">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5 text-gray-400" />
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded-full"
            onClick={toggleDropdown}
            aria-label={isDropdownOpen ? "Close dropdown" : "Open dropdown"}
            tabIndex={0}
          >
            <FontAwesomeIcon 
              icon={isDropdownOpen ? faChevronUp : faChevronDown} 
              className="h-3 w-3 text-gray-400" 
            />
          </button>
        </div>
      </div>
      
      {validationError && (
        <p className="mt-1 text-sm text-red-600">{validationError}</p>
      )}

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200"
          >
            <ul 
              id={dropdownId.current}
              ref={listRef}
              role="listbox"
              aria-label="Search results"
              className="w-full"
              tabIndex={-1}
            >
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <motion.li
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    key={getItemId(item)}
                    id={`dropdown-item-${getItemId(item)}`}
                    role="option"
                    aria-selected={highlightedIndex === index}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "cursor-pointer",
                      highlightedIndex === index && "bg-gray-100",
                      selectedItem === item && "font-medium"
                    )}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    tabIndex={-1} // Remove from tab sequence, but allow programmatic focus
                    onFocus={() => setHighlightedIndex(index)}
                  >
                    {renderItem(item, highlightedIndex === index, selectedItem === item)}
                  </motion.li>
                ))
              ) : (
                <li className="px-4 py-2 text-sm text-gray-500" role="option" aria-selected="false">
                  {noResultsMessage}
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 