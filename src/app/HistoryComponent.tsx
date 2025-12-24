"use client";

import React, { useState, useEffect } from "react";
import * as HistoryRequests from "@/requests/History";
import * as HistoryModels from "@/types/HistoryModels";
import { EnumTypeHistory, EnumWorkPlan, getWorkPlanDisplayName, getHistoryTypeText } from "@/types/Enums";
import {
    CurrencyDollarIcon,
    UserCircleIcon,
    UserIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    DocumentIcon,
    ShieldCheckIcon,
    TrashIcon,
    PlusIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";

const PRIMARY_COLOR = "#2563eb";
const LIGHT_BLUE = "#dbeafe";
const BG_GRADIENT = "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)";

interface HistoryComponentProps {
    userId: string;
    title?: string;
    className?: string;
    compact?: boolean;
}

// Улучшенный хук для загрузки истории
const useHistory = (userId: string) => {
    const [history, setHistory] = useState<{ items: HistoryModels.HistoryGetResponseListItem[] }>({ items: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const response = await HistoryRequests.Get({ UserId: userId });
            setHistory({ items: response.items || [] });
            setError(null);
        } catch (err: any) {
            setError(err.message || "Ошибка загрузки истории");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [userId]);

    return { history, loading, error, refresh: loadHistory };
};

const getHistoryIcon = (type: EnumTypeHistory) => {
    const iconMap = {
        [EnumTypeHistory.ChangeSalary]: CurrencyDollarIcon,
        [EnumTypeHistory.ChangeFotoProfile]: UserCircleIcon,
        [EnumTypeHistory.ChangeFotoDocuments]: UserCircleIcon,
        [EnumTypeHistory.ChangeFirstName]: UserIcon,
        [EnumTypeHistory.ChangeMiddleName]: UserIcon,
        [EnumTypeHistory.ChangeLastName]: UserIcon,
        [EnumTypeHistory.ChangePosition]: BriefcaseIcon,
        [EnumTypeHistory.ChangeDepartment]: BuildingOfficeIcon,
        [EnumTypeHistory.ChangeWorkPlan]: CalendarIcon,
        [EnumTypeHistory.Deleted]: TrashIcon,
        [EnumTypeHistory.Add]: PlusIcon,
        [EnumTypeHistory.ChengeAccessCanManage]: ShieldCheckIcon,
    } as const;

    const IconComponent = iconMap[type] || DocumentIcon;
    return <IconComponent className="w-4 h-4" />;
};

// Форматируем значение с учетом типа истории
const formatHistoryValue = (value: string, type: EnumTypeHistory): string => {
  try {
    const parsed = JSON.parse(value);

    switch (type) {
      case EnumTypeHistory.ChangeSalary:
        return parsed.Value ? `Оклад: ${parsed.Value} ₽` : "Изменен оклад";

      case EnumTypeHistory.ChangeFirstName:
        return parsed.Value ? `Имя: ${parsed.Value}` : "Изменено имя";

      case EnumTypeHistory.ChangeMiddleName:
        return parsed.Value ? `Отчество: ${parsed.Value}` : "Изменено отчество";

      case EnumTypeHistory.ChangeLastName:
        return parsed.Value ? `Фамилия: ${parsed.Value}` : "Изменена фамилия";

      case EnumTypeHistory.ChangePosition:
        return parsed.Value ? `Должность: ${parsed.Value}` : "Изменена должность";

      case EnumTypeHistory.ChangeDepartment:
        return parsed.Value ? `Отдел: ${parsed.Value}` : "Изменен отдел";

      case EnumTypeHistory.ChangeWorkPlan:
        return parsed.WorkPlan != null
          ? `График работы: ${getWorkPlanDisplayName(parsed.WorkPlan)}`
          : "Изменен график работы";

      case EnumTypeHistory.ChangeFotoProfile:
        return "Изменено фото профиля";

      case EnumTypeHistory.ChangeFotoDocuments:
        return "Изменены фото документов";

      case EnumTypeHistory.Add:
        return "Пользователь добавлен";

      case EnumTypeHistory.Deleted:
        return "Пользователь удален";

      case EnumTypeHistory.ChengeAccessCanManage:
        return !parsed.AccessCanManage
          ? "Предоставлен доступ к управлению"
          : "Запрещен доступ к управлению";

      default:
        if (parsed.Value !== undefined && parsed.Value !== null)
          return parsed.Value.toString();

        return "Изменение внесено";
    }
  } catch (err) {
    return value;
  }
};

// Форматируем дату
const formatDate = (timestamp?: string): string => {
    if (!timestamp) return "";
    try {
        const date = new Date(timestamp);
        return date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
};

// Компонент для отображения одной записи истории
const HistoryItem = ({ 
    item, 
    index, 
    totalItems,
    showTimeline = true 
}: { 
    item: HistoryModels.HistoryGetResponseListItem;
    index: number;
    totalItems: number;
    showTimeline?: boolean;
}) => {
    const hasAvatar = !!item.fotoUrlUserCreated;
    
    return (
        <div className="relative group">
            {/* Линия времени */}
            {showTimeline && index < totalItems - 1 && (
                <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-blue-100" />
            )}

            <div className="flex items-start gap-3 p-3 rounded-lg group-hover:bg-blue-50 transition-colors">
                {/* Аватар/Иконка */}
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                        {hasAvatar ? (
                            <img 
                                src={item.fotoUrlUserCreated} 
                                alt={item.fullNameUserCreated || ""}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserIcon className="w-5 h-5 text-blue-600" />
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center">
                        {getHistoryIcon(item.type)}
                    </div>
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-medium text-sm text-gray-900 truncate">
                            {item.fullNameUserCreated || "Неизвестно"}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {getHistoryTypeText(item.type)}
                        </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-1.5">
                        {formatHistoryValue(item.value,item.type)}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {formatDate(item.dateCreated)}
                    </div>
                </div>

                {/* Точка времени */}
                {showTimeline && (
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                )}
            </div>
        </div>
    );
};

// Компактный вариант
const CompactHistoryComponent = ({ userId, className = "" }: HistoryComponentProps) => {
    const { history, loading, error, refresh } = useHistory(userId);
    
    if (loading) {
        return (
            <div className={`bg-white rounded-xl border p-4 ${className}`}>
                <div className="animate-pulse space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className={`bg-white rounded-xl border p-4 ${className}`}>
                <div className="text-center py-2">
                    <p className="text-red-500 text-sm mb-2">{error}</p>
                    <button
                        onClick={refresh}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Повторить
                    </button>
                </div>
            </div>
        );
    }
    
    if (history.items.length === 0) {
        return (
            <div className={`bg-white rounded-xl border p-4 ${className}`}>
                <div className="text-center py-2">
                    <DocumentIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">История отсутствует</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`bg-white rounded-xl border ${className}`}>
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">История изменений</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {history.items.length}
                    </span>
                </div>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
                <div className="divide-y">
                    {history.items.map((item, index) => (
                        <HistoryItem 
                            key={index}
                            item={item}
                            index={index}
                            totalItems={history.items.length}
                            showTimeline={false}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Основной компонент
export default function HistoryComponent({
    userId,
    title = "История изменений",
    className = "",
    compact = false
}: HistoryComponentProps) {
    
    if (compact) {
        return <CompactHistoryComponent userId={userId} className={className} />;
    }
    
    const { history, loading, error, refresh } = useHistory(userId);

    if (loading) {
        return (
            <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
                <div className="text-center py-6">
                    <p className="text-red-600 mb-3">{error}</p>
                    <button
                        onClick={refresh}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                        Повторить
                    </button>
                </div>
            </div>
        );
    }

    if (history.items.length === 0) {
        return (
            <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
                <div className="text-center py-6">
                    <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">История изменений отсутствует</p>
                    <button
                        onClick={refresh}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                        Обновить
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden ${className}`}>
            {/* Заголовок */}
            <div className="px-5 py-4 text-white" style={{ background: BG_GRADIENT }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DocumentIcon className="w-5 h-5" />
                        <h2 className="text-lg font-bold">{title}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-blue-100 text-sm">
                            {history.items.length} изменений
                        </span>
                        <button
                            onClick={refresh}
                            className="text-blue-100 hover:text-white transition-colors"
                            title="Обновить"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Список истории */}
            <div className="max-h-[500px] overflow-y-auto p-4">
                <div className="space-y-2">
                    {history.items.map((item, index) => (
                        <HistoryItem 
                            key={index}
                            item={item}
                            index={index}
                            totalItems={history.items.length}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}