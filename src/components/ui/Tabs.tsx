'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                }
                ${tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6" key={activeTab}>
        {activeTabContent}
      </div>
    </div>
  );
}

interface SubTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function SubTabs({ tabs, defaultTab, className = '' }: SubTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      {/* Sub Tab Navigation */}
      <div className="border-b border-gray-100">
        <nav className="flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`
                whitespace-nowrap py-2 px-1 border-b font-medium text-xs transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }
                ${tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub Tab Content */}
      <div className="mt-4" key={activeTab}>
        {activeTabContent}
      </div>
    </div>
  );
}