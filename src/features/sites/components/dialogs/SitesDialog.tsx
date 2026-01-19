// SitesDialog.tsx
import { useState } from "react";
import { X, Check } from "lucide-react";
import { Site } from '../../types';
import Stage1 from "./Stage1";
import Stage2 from "./Stage2";

interface SitesDialogProps {
  mode: "create" | "edit";
  siteData?: Partial<Site>;
  onSave: (data: Partial<Site>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function SitesDialog({ mode, siteData, onSave, onCancel, isOpen }: SitesDialogProps) {
  const [formData, setFormData] = useState<Partial<Site>>(siteData || {});
  const [currentTab, setCurrentTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState<boolean[]>([false, false]);

  const tabs = [
    { id: "stage1", name: "Basic Info", icon: "1" },
    { id: "stage2", name: "Configuration", icon: "2" },
  ];

  // Check if current step is valid
  const isStepValid = (step: number): boolean => {
    // For now, allow all steps. You can add validation logic here
    return true;
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTabClick = (index: number) => {
    const isUnlocked = index === 0 || completedTabs[index - 1];
    if (isUnlocked) {
      setCurrentTab(index);
    }
  };

  const handleNext = () => {
    if (isStepValid(currentTab)) {
      const newCompleted = [...completedTabs];
      newCompleted[currentTab] = true;
      setCompletedTabs(newCompleted);
      if (currentTab < tabs.length - 1) {
        setCurrentTab(currentTab + 1);
      }
    }
  };

  const handleSubmit = () => {
    if (isStepValid(currentTab)) {
      onSave(formData);
      onCancel();
      // Reset
      setCurrentTab(0);
      setCompletedTabs([false, false]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Site' : 'Edit Site'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Side Tabs */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab, index) => {
                const isCompleted = completedTabs[index];
                const isCurrent = currentTab === index;
                const isUnlocked = index === 0 || completedTabs[index - 1];

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(index)}
                    disabled={!isUnlocked}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                      ${isCurrent
                        ? 'bg-blue-600 text-white shadow-md'
                        : isCompleted
                        ? 'bg-green-50 text-green-900 hover:bg-green-100'
                        : isUnlocked
                        ? 'bg-white text-gray-700 hover:bg-gray-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                        ${isCurrent
                          ? 'bg-blue-700 text-white'
                          : isCompleted
                          ? 'bg-green-600 text-white'
                          : isUnlocked
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-gray-200 text-gray-400'
                        }
                      `}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : tab.icon}
                    </div>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              {currentTab === 0 && (
                <Stage1 
                  data={formData} 
                  onChange={handleFieldChange}
                  isOpen={isOpen}
                  onClose={onCancel}
                />
              )}
              {currentTab === 1 && (
                <Stage2 
                  data={formData} 
                  onChange={handleFieldChange}
                  isOpen={isOpen}
                  onClose={onCancel}
                />
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
              <button
                onClick={() => setCurrentTab(Math.max(0, currentTab - 1))}
                disabled={currentTab === 0}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Step {currentTab + 1} of {tabs.length}
                </span>
              </div>

              {currentTab < tabs.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid(currentTab)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentTab)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
