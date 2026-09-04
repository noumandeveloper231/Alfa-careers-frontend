import React, { useState } from 'react';
import SkillsManager from './SkillsManager';
import CategoryManager from './CategoryManager';
import CandidateCategoryManager from './CandidateCategoryManager';
import CompanyCategoryManager from './CompanyCategoryManager';
const tabs = [
  { key: 'skills', label: 'Skills Manager' },
  { key: 'categories', label: 'Category Manager' },
  { key: 'candidateCategories', label: 'Candidate Category Manager' },
  { key: 'companyCategories', label: 'Company Category Manager' }
];

const AdminSettings = () => {
  const [active, setActive] = useState('skills');

  return (
    <div className="border border-gray-300 rounded-3xl bg-white w-full overflow-y-auto min-h-screen p-6">
      {/* Tabs header */}
      <div className="mb-6 flex gap-3 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 focus:outline-none transition-colors ${active === tab.key
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      {active === 'skills' && <SkillsManager />}
      {active === 'categories' && <CategoryManager />}
      {active === 'candidateCategories' && <CandidateCategoryManager />}
      {active === 'companyCategories' && <CompanyCategoryManager />}
    </div>
  );
};

export default AdminSettings;