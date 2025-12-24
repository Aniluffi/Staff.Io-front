"use client";

import { CogIcon } from "@heroicons/react/24/outline";

export const SettingsHeader = () => {
  return (
    <div className="mb-8 pb-6 border-b border-blue-100">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <CogIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
            <p className="text-gray-600">Управление настройками компании и профилем</p>
          </div>
        </div>
      </div>
    </div>
  );
};