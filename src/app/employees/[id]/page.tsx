"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import * as EmployeesRequests from "@/requests/Employees";
import * as AdminRequests from "@/requests/Admin";
import * as AdminModels from "@/types/AdminModels";
import Layout from "@/components/Layout";
import {
  EnumUserRole,
  EnumWorkPlan,
  getRoleDisplayName,
  getWorkPlanDisplayName,
  EnumUserStatus,
  getStatusDisplayName
} from "@/types/Enums";
import { DocumentsSection } from "@/components/profile/FormDocument"
import {
  CameraIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import HistoryComponent from "@/app/HistoryComponent"

const PRIMARY_COLOR = "#2563eb";
const LIGHT_BLUE = "#dbeafe";
const HOVER_BLUE = "#1d4ed8";
const ERROR_COLOR = "#ef4444";
const SUCCESS_COLOR = "#10b981";

interface DocumentState extends AdminModels.FotoItem {
  id: string;
  isNew?: boolean;
  url?: string; // Для существующих документов сохраняем URL
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params?.id as string;

  const [user, setUser] = useState<AdminModels.AdminUpdateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentState[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    position: "",
    salary: "",
    workPlan: "",
    login: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Проверяем права текущего пользователя
  const isCurrentUserAdmin = currentUser?.role === EnumUserRole.Admin || currentUser?.role === EnumUserRole.Owner;
  const isCurrentUserOwner = currentUser?.role === EnumUserRole.Owner;
  const isViewedUserAdmin = user?.typeRole === EnumUserRole.Admin;

  // Может ли текущий пользователь редактировать профиль
  const canEditProfile = isCurrentUserOwner || (isCurrentUserAdmin && !isViewedUserAdmin);

  // Может ли текущий пользователь управлять доступом админа
  const canManageAccess = isCurrentUserOwner || (isCurrentUserAdmin && isViewedUserAdmin);

  // Функция для конвертации файла в base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
    });
  };

  // Инициализация документов из URL
  const initializeDocuments = useCallback((docUrls: string[] = []) => {
    const initialDocs: DocumentState[] = docUrls.map((url, index) => ({
      id: `doc-${Date.now()}-${index}`,
      name: url.split('/').pop() || `document-${index + 1}.jpg`,
      base64: '', // URL документов, base64 будет пустым
      url: url // Сохраняем оригинальный URL для отображения
    }));
    setDocuments(initialDocs);
  }, []);

  // Загрузка данных пользователя
  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const data = await EmployeesRequests.GetDetail({ userId });
        setUser(data);
        setCanManage(data.accessCanManage ?? false);

        // Инициализируем форму данными пользователя
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          middleName: data.middleName || "",
          position: data.position || "",
          salary: data.salary?.toString() || "0",
          workPlan: getWorkPlanDisplayName(data.workPlan),
          login: data.login
        });

        setPhotoPreview(data.userFotoUrl || null);
        initializeDocuments(data.documents);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [userId, initializeDocuments]);

  // Обновление доступа "может управлять"
  const toggleAccess = async () => {
    if (!user || !canManageAccess) return;

    try {
      setUpdating(true);
      const response = await AdminRequests.UpdateAccessCanManage({ userId });
      setCanManage(response.currentAccess);
      setSuccessMessage("Доступ успешно обновлен");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Ошибка обновления доступа");
    } finally {
      setUpdating(false);
    }
  };

  // Обработчики для редактирования профиля
  const handleEditClick = () => {
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(user?.userFotoUrl || null);
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      middleName: user?.middleName || "",
      position: user?.position || "",
      salary: user?.salary?.toString() || "",
      workPlan: user?.workPlan?.toString() ?? "",
      login: ""
    });
    initializeDocuments(user?.documents);
    setError(null);
  };

  // Обработчик добавления новых документов
  const handleAddDocument = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const newDocuments: DocumentState[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith('image/')) {
          setError("Пожалуйста, выберите изображения");
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError(`Размер файла ${file.name} превышает 5MB`);
          return;
        }

        const base64 = await convertFileToBase64(file);
        newDocuments.push({
          id: `new-doc-${Date.now()}-${i}`,
          name: file.name,
          base64,
          isNew: true
        });
      }

      setDocuments(prev => [...prev, ...newDocuments]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Ошибка при загрузке документов");
    }
  };

  // Обработчик удаления документа
  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Получение документов для отправки на сервер
  const getDocumentsForUpdate = (): AdminModels.FotoItem[] => {
    return documents.map(doc => ({
      name: doc.name,
      base64: doc.base64 || '' // Для существующих документов base64 будет пустым
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Пожалуйста, выберите изображение");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Размер изображения не должен превышать 5MB");
        return;
      }

      setPhotoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const base64Photo = photoFile ? await convertFileToBase64(photoFile) : null;
      const documentItems = getDocumentsForUpdate();

      const updateData: AdminModels.AdminUpdateRequest = {
        userId: user.userId,
        userFoto: base64Photo ? {
          base64: base64Photo,
          name: photoFile?.name ?? "photo.jpg"
        } : null,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        documents: documentItems,
        position: formData.position || null,
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        workPlan: formData.workPlan
          ? Number(formData.workPlan) as EnumWorkPlan
          : null,
      };

      const response = await AdminRequests.Update(updateData);

      // Обновляем локальные данные
      setUser(response);
      setSuccessMessage("Профиль успешно обновлен");

      // Обновляем документы с новыми URL с сервера
      const updatedDocs: DocumentState[] = response.documents.map((url, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: url.split('/').pop() || `document-${index + 1}.jpg`,
        base64: '',
        url: url
      }));
      setDocuments(updatedDocs);

      setIsEditing(false);
      setPhotoFile(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Ошибка при обновлении профиля");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="p-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Назад
          </button>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Пользователь не найден</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Сообщения */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <XMarkIcon className="w-5 h-5 text-red-500" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckIcon className="w-5 h-5 text-green-500" />
              <p className="text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Хедер с кнопками */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 transition-all duration-200 shadow-sm"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Профиль сотрудника</h1>
                  <p className="text-gray-600">Просмотр и редактирование информации</p>
                </div>
              </div>

              {canEditProfile && !isEditing && (
                <button
                  onClick={handleEditClick}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                >
                  <PencilIcon className="w-5 h-5" />
                  Редактировать профиль
                </button>
              )}
            </div>
          </div>

          {/* Основной контент */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Левая колонка - Фото и управление доступом */}
            <div className="lg:col-span-1 space-y-6">
              {/* Блок с фото */}
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Фотография</h3>
                <div
                  className={`relative w-full aspect-square rounded-2xl overflow-hidden ${isEditing ? 'border-2 border-blue-500 cursor-pointer' : 'border border-blue-200'} group`}
                  onClick={handlePhotoClick}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Фото пользователя"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <UserIcon className="w-1/3 h-1/3 text-white" />
                    </div>
                  )}

                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <CameraIcon className="w-10 h-10 text-white" />
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {isEditing && (
                  <p className="text-sm text-gray-500 text-center mt-3">
                    Нажмите на фото для изменения
                  </p>
                )}
              </div>

              {/* Статус и роль */}
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Статус и роль</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Роль:</span>
                    </div>
                    <span className={`text-lg font-bold ${isViewedUserAdmin ? 'text-blue-600' : 'text-gray-900'}`}>
                      {getRoleDisplayName(user.typeRole)}
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Статус:</span>
                    </div>
                    <span className={`text-lg font-bold ${user.status === EnumUserStatus.Active ? 'text-green-600' :
                      user.status === EnumUserStatus.Deactivated ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                      {getStatusDisplayName(user.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Управление доступом */}
              {(canManageAccess && user.typeRole != EnumUserRole.Employee) && (
                <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
                    Административный доступ
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="manage-access"
                        checked={canManage}
                        onChange={toggleAccess}
                        disabled={updating || !canManageAccess}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="manage-access"
                        className={`text-sm font-medium ${canManageAccess ? 'text-gray-900' : 'text-gray-400'}`}
                      >
                        Разрешить управление сотрудниками
                      </label>
                    </div>

                    <p className="text-sm text-gray-600">
                      {canManage
                        ? "Пользователь может управлять другими сотрудниками"
                        : "Пользователь не может управлять другими сотрудниками"}
                    </p>

                    {updating && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                        Обновление...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Правая колонка - Основная информация */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                {/* Заголовок и кнопки действий в режиме редактирования */}
                {isEditing && (
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="w-5 h-5" />
                            Сохранить изменения
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-xl shadow hover:from-gray-200 hover:to-gray-300 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        <XMarkIcon className="w-5 h-5" />
                        Отмена
                      </button>
                    </div>
                  </div>
                )}

                {/* ФИО */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-blue-100">
                    Личные данные
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Фамилия
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-50"
                          placeholder="Введите фамилию"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl text-gray-900 font-medium">
                          {user.lastName || "Не указано"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Имя
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-50"
                          placeholder="Введите имя"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl text-gray-900 font-medium">
                          {user.firstName || "Не указано"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Отчество
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-50"
                          placeholder="Введите отчество"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl text-gray-900 font-medium">
                          {user.middleName || "Не указано"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Рабочая информация */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-blue-100">
                    Рабочая информация
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="md:col-span-2 lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Должность
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-50"
                          placeholder="Введите должность"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl text-gray-900 font-medium">
                          {user.position || "Не указано"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Зарплата
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleInputChange}
                            disabled={isSaving}
                            className="w-full px-4 py-3 pl-10 border border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-50"
                            placeholder="0.00"
                          />
                          <CurrencyDollarIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl text-gray-900 font-medium">
                          {user.salary ? `${user.salary.toLocaleString('ru-RU')} ₽` : "Не указано"}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        График работы
                      </label>
                      {isEditing ? (
                        <select
                          name="workPlan"
                          value={formData.workPlan}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-50"
                        >
                          <option value="">Выберите график</option>
                          {Object.values(EnumWorkPlan)
                            .filter((v): v is EnumWorkPlan => typeof v === "number")
                            .map((plan) => (
                              <option key={plan} value={plan}>
                                {getWorkPlanDisplayName(plan)}
                              </option>
                            ))
                          }
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl text-gray-900 font-medium flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-blue-500" />
                          {getWorkPlanDisplayName(user.workPlan) || "Не указано"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Документы */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-blue-100">
                    Документы
                  </h2>
                  <DocumentsSection
                    documentUrls={user.documents}
                    documentItems={documents}
                    isEditing={isEditing}
                    onAddDocument={handleAddDocument}
                    onRemoveDocument={handleRemoveDocument}
                  />
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-blue-100">
                    История изменений профиля
                  </h2>
                  <HistoryComponent
                    userId={user.userId}
                    title=""
                  />
                </div>
                <div style={{ marginTop: "24px" }}>
                  <div style={{
                    background: "#fefefe",
                    padding: "28px",
                    borderRadius: "24px",
                    border: "1px solid #f5f5f5",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.03)"
                  }}>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px"
                    }}>

                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flex: 1,
                        paddingRight: "20px",
                        borderRight: "1px solid #f0f0f0"
                      }}>
                        <div style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "14px",
                          background: "linear-gradient(135deg, #f6f8ff, #f0f4ff)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#667eea",
                          fontWeight: "600",
                          fontSize: "20px"
                        }}>
                          #
                        </div>
                        <div>
                          <div style={{
                            fontSize: "13px",
                            color: "#888",
                          }}>
                            ID пользователя
                          </div>
                          <div style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#333",
                            letterSpacing: "0.5px"
                          }}>
                            {user.userId}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flex: 1
                      }}>
                        <div style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "14px",
                          background: formData.login
                            ? "linear-gradient(135deg, #f0fff8, #e6fff0)"
                            : "linear-gradient(135deg, #fffcf0, #fff8e6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: formData.login ? "#48bb78" : "#ecc94b",
                          fontWeight: "600",
                          fontSize: "20px"
                        }}>
                          @
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: "13px",
                            color: "#888",
                            marginBottom: "4px"
                          }}>
                            Электронная почта
                          </div>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px"
                          }}>
                            <div style={{
                              fontSize: "18px",
                              fontWeight: "500",
                              color: formData.login ? "#333" : "#aaa",
                              flex: 1
                            }}>
                              {formData.login || "Не указана"}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}