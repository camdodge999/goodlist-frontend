import { Tab } from "@/types/tabs";


interface UnderlineTabProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function UnderlineTab({ tabs, activeTab, onTabChange }: UnderlineTabProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
                whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm text-center cursor-pointer
                ${activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
              `}
          >
            <span>{tab.name}</span>
            {(tab.count || tab.count === 0) && ( 
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
} 