"use client";

import { useState, useRef } from 'react';
import {
    BuildingOfficeIcon,
    UserIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    CameraIcon,
    TrashIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import * as AdminModels from '@/types/AdminModels';
import { UpdateOwner } from '@/requests/Admin';
import { EnumUserRole } from '@/types/Enums';

interface UserInfoSectionProps {
    user: any;
    isOwner: boolean;
    onUpdate?: (data: { name?: string; foto?: string | null }) => void;
}

export const UserInfoSection: React.FC<UserInfoSectionProps> = ({
    user,
    isOwner,
    onUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewFoto, setPreviewFoto] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const fullName = `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim();
    const roleText = isOwner
        ? "Владелец компании"
        : user?.role === EnumUserRole.Admin
            ? "Администратор"
            : "Пользователь";

    // Инициализируем редактирование
    const initEditing = () => {
        setEditedName(fullName);
        setSelectedFile(null);
        setPreviewFoto(null);
        setIsEditing(true);
        setError(null);
        setSuccessMessage(null);
    };

    // Обработчик выбора файла
    const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Проверяем тип файла
            if (!file.type.startsWith('image/')) {
                setError('Пожалуйста, выберите изображение');
                return;
            }

            // Проверяем размер файла (например, максимум 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Размер файла не должен превышать 5MB');
                return;
            }

            setSelectedFile(file);

            // Создаем предпросмотр для отображения
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewFoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Открываем диалог выбора файла
    const handleFotoClick = () => {
        fileInputRef.current?.click();
    };

    // Удаляем выбранное фото
    const handleRemoveFoto = () => {
        setSelectedFile(null);
        setPreviewFoto(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Получаем URL для отображения фото
    const getFotoUrl = (): string | null => {
        // Если есть предпросмотр (data URL), используем его
        if (previewFoto) return previewFoto;
        
        
        
        return user.fotoUrl ?? "";
    };

    // Извлекаем чистый base64 из data URL
    const extractBase64FromDataUrl = (dataUrl: string): string => {
        // data URL формат: "data:image/png;base64,base64string"
        const commaIndex = dataUrl.indexOf(',');
        if (commaIndex === -1) return dataUrl;
        
        // Возвращаем только часть после запятой (чистый base64)
        return dataUrl.substring(commaIndex + 1);
    };

    // Создаем FotoItem из файла (для отправки в запросе)
    const createFotoItemFromFile = async (file: File): Promise<AdminModels.FotoItem | null> => {
        try {
            // Преобразуем файл в base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    // Получаем data URL и извлекаем чистый base64
                    const dataUrl = reader.result as string;
                    const base64 = extractBase64FromDataUrl(dataUrl);
                    resolve(base64);
                };
                reader.onerror = error => reject(error);
            });

            // Создаем FotoItem для отправки в запросе
            const fotoItem: AdminModels.FotoItem = {
                name: file.name,
                base64: base64 // Чистый base64
            };

            return fotoItem;
        } catch (error) {
            console.error("Ошибка при создании FotoItem:", error);
            return null;
        }
    };

    // Создаем FotoItem из существующего фото (если оно есть)
    const createFotoItemFromExisting = (): AdminModels.FotoItem | null => {
        if (!user?.foto) return null;

        // Если фото уже в формате FotoItem
        if (typeof user.foto === 'object' && user.foto.url) {
            return user.foto;
        }

        // Если фото как строка (base64 или data URL)
        if (typeof user.foto === 'string') {
            let base64: string;
            let mimeType: string = 'image/jpeg';
            
            if (user.foto.startsWith('data:')) {
                // Если data URL, извлекаем base64 и тип
                base64 = extractBase64FromDataUrl(user.foto);
                const semicolonIndex = user.foto.indexOf(';');
                mimeType = user.foto.substring(5, semicolonIndex); // Пропускаем "data:"
            } else {
                // Если чистый base64
                base64 = user.foto;
                // Пытаемся определить тип по первым символам
                const firstChar = user.foto.charAt(0);
                if (firstChar === '/') mimeType = 'image/jpeg';
                else if (firstChar === 'i') mimeType = 'image/png';
                else if (firstChar === 'R') mimeType = 'image/gif';
                else if (firstChar === 'U') mimeType = 'image/webp';
            }

            const fotoItem: AdminModels.FotoItem = {
                name: 'profile.jpg',
                base64: base64
            };

            return fotoItem;
        }

        return null;
    };

    // Сохраняем изменения
    const handleSave = async () => {
        if (!editedName.trim()) {
            setError('Имя не может быть пустым');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            let fotoItem: AdminModels.FotoItem | null = null;

            // Если выбран новый файл, создаем FotoItem
            if (selectedFile) {
                fotoItem = await createFotoItemFromFile(selectedFile);
                if (!fotoItem) {
                    throw new Error('Не удалось обработать изображение');
                }
            } else if (previewFoto === null) {
                // Если фото удалено (кнопкой "удалить фото")
                fotoItem = null;
            } else if (!selectedFile && !previewFoto && user?.foto) {
                // Если фото не менялось, используем существующее
                fotoItem = createFotoItemFromExisting();
            }
            // Если ничего не менялось и фото не было, fotoItem останется null

            // СОЗДАЕМ ЗАПРОС С FotoItem (как требуется в API)
            const request: AdminModels.AdminUpdateOwnerRequest = {
                name: editedName.trim(),
                foto: fotoItem // Отправляем как FotoItem или null
            };

            console.log("Отправляем запрос на обновление владельца (с FotoItem):", {
                name: request.name,
                foto: fotoItem ? {
                    fileName: fotoItem.name,
                    base64: `base64 длиной ${fotoItem.base64.length} символов`
                } : null
            });

            // ВЫЗЫВАЕМ API - ОТПРАВЛЯЕМ FotoItem
            const response = await UpdateOwner(request);

            console.log("Ответ от сервера (возвращает string | null):", response);

            // ОБРАБАТЫВАЕМ ОТВЕТ - сервер возвращает string | null
            if (onUpdate) {
                onUpdate({
                    name: response.name,
                    foto: response.foto // Ответ: string | null
                });
            }

            setSuccessMessage('Данные успешно обновлены');
            setIsEditing(false);

            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);

        } catch (err: any) {
            console.error("Ошибка при сохранении:", err);
            setError(err.message || 'Произошла ошибка при обновлении данных');
        } finally {
            setIsLoading(false);
        }
    };

    // Отменяем редактирование
    const handleCancel = () => {
        setIsEditing(false);
        setEditedName('');
        setSelectedFile(null);
        setPreviewFoto(null);
        setError(null);
        setSuccessMessage(null);
    };

    const fotoUrl = getFotoUrl();

    return (
        <div className="text-center">
            <div className="mb-6 relative">

                {/* Сообщения об ошибках и успехе */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Режим редактирования */}
                {isEditing ? (
                    <div className="space-y-6 pt-4">
                        {/* Редактирование фото */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 bg-blue-50 flex items-center justify-center">
                                    {fotoUrl ? (
                                        <img
                                            src={fotoUrl}
                                            alt="Фото профиля"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserCircleIcon className="w-20 h-20 text-blue-300" />
                                    )}
                                </div>

                                <div className="absolute bottom-0 right-0 flex gap-2">
                                    <button
                                        onClick={handleFotoClick}
                                        disabled={isLoading}
                                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
                                        title="Изменить фото"
                                    >
                                        <CameraIcon className="w-5 h-5" />
                                    </button>

                                    {fotoUrl && (
                                        <button
                                            onClick={handleRemoveFoto}
                                            disabled={isLoading}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
                                            title="Удалить фото"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFotoChange}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                            </div>

                            <p className="text-sm text-gray-500">
                                Нажмите на иконку камеры для изменения фото
                            </p>
                        </div>

                        {/* Редактирование имени */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Полное имя владельца
                            </label>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                                placeholder="Введите полное имя"
                                disabled={isLoading}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Это имя будет отображаться как имя владельца компании
                            </p>
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
                            >
                                <CheckIcon className="w-5 h-5" />
                                <span className="font-medium">
                                    {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                                </span>
                            </button>

                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
                            >
                                <XMarkIcon className="w-5 h-5" />
                                <span className="font-medium">Отмена</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="pt-4">
                            {/* Аватар */}
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 bg-blue-50 flex items-center justify-center">
                                        {fotoUrl ? (
                                            <img
                                                src={fotoUrl}
                                                alt="Фото профиля"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserCircleIcon className="w-20 h-20 text-blue-300" />
                                        )}
                                    </div>
                                    {isOwner && (
                                        <div className="absolute -bottom-2 -right-2">
                                            <BuildingOfficeIcon className="w-8 h-8 text-blue-500 bg-white rounded-full p-1 shadow-md" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Имя */}
                            <div className="flex items-center justify-center gap-3 mb-3">
                                {isOwner ? (
                                    <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />
                                ) : (
                                    <UserIcon className="w-6 h-6 text-blue-500" />
                                )}
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {fullName}
                                </h2>
                            </div>

                            {/* Информация о типе пользователя */}
                            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-4">
                                <UserIcon className="w-4 h-4" />
                                <span>
                                    {isOwner ? `Владелец: ${fullName}` : `Пользователь: ${fullName}`}
                                </span>
                            </div>

                        </div>

                        {isOwner && !isEditing && (
                            <button
                                onClick={initEditing}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg mt-10"
                            >
                                <PencilIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">Редактировать профиль</span>
                            </button>
                        )}
                    </>
                )}
                <div className="flex justify-center gap-4 pt-4">

                </div>
            </div>
        </div>
    );
};