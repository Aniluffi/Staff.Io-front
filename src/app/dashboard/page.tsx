"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/app/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import * as EmployeesRequests from "@/requests/Employees";
import * as AdminRequests from "@/requests/Admin";
import { useState, useEffect, useRef } from "react";
import { getRoleDisplayName, getWorkPlanDisplayName, getStatusDisplayName, EnumWorkPlan } from "@/types/Enums"
import { FotoItem } from "@/types/AdminModels"
import { DocumentsSection } from "@/components/profile/FormDocument"
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  CurrencyDollarIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import HistoryComponent from "@/app/HistoryComponent"

// ==================== Компоненты ====================

interface MessageAlertProps {
  type: 'error' | 'success';
  message: string | null;
  icon: React.ReactNode;
}

const MessageAlert: React.FC<MessageAlertProps> = ({ type, message, icon }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = type === 'error' ? 'text-red-600' : 'text-green-600';
  const iconColor = type === 'error' ? 'text-red-500' : 'text-green-500';

  return (
    <div className={`mb-6 p-4 ${bgColor} border rounded-xl flex items-center gap-3`}>
      <div className={iconColor}>{icon}</div>
      <p className={textColor}>{message}</p>
    </div>
  );
};

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  isEditing: boolean;
  isSaving?: boolean;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  displayValue?: string; // Добавлено новое поле для отображения
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  isEditing,
  isSaving = false,
  type = 'text',
  options = [],
  displayValue, // Используем это значение для отображения в режиме просмотра
  onChange,
  placeholder,
  icon
}) => {
  if (isEditing) {
    if (type === 'select') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={isSaving}
            className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-50"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        {icon ? (
          <div className="relative">
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              disabled={isSaving}
              className="w-full px-4 py-3 pl-10 border border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-50"
              placeholder={placeholder}
              min={type === 'number' ? "0" : undefined}
              step={type === 'number' ? "0.01" : undefined}
            />
            <div className="absolute left-3 top-3.5 w-5 h-5 text-gray-400">
              {icon}
            </div>
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={isSaving}
            className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-50"
            placeholder={placeholder}
          />
        )}
      </div>
    );
  }

  // Режим просмотра
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl text-gray-900 font-medium">
        {displayValue || value || "Не указано"}
      </div>
    </div>
  );
};





interface ProfileAvatarProps {
  photoPreview: string | null;
  isEditing: boolean;
  onPhotoClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>; // Разрешаем null
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  photoPreview,
  isEditing,
  onPhotoClick,
  onFileChange,
  fileInputRef
}) => {
  return (
    <div className="relative mb-6">
      <div
        className={`relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 ${isEditing ? 'border-blue-500' : 'border-blue-200'} cursor-pointer group`}
        onClick={onPhotoClick}
      >
        {photoPreview ? (
          <img
            src={photoPreview}
            alt="Фото профиля"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <UserCircleIcon className="w-32 h-32 text-white" />
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
          onChange={onFileChange}
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
  );
};

interface ActionButtonsProps {
  isEditing: boolean;
  isSaving: boolean;
  onEditClick: () => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isEditing,
  isSaving,
  onEditClick,
  onSaveClick,
  onCancelClick
}) => {
  if (!isEditing) {
    return (
      <button
        onClick={onEditClick}
        className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <PencilIcon className="w-4 h-4" />
        Редактировать профиль
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <button
        onClick={onSaveClick}
        disabled={isSaving}
        className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            Сохранение...
          </>
        ) : (
          <>
            <CheckIcon className="w-4 h-4" />
            Сохранить
          </>
        )}
      </button>

      <button
        onClick={onCancelClick}
        disabled={isSaving}
        className="flex-1 px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <XMarkIcon className="w-4 h-4" />
        Отмена
      </button>
    </div>
  );
};

// ==================== Основной компонент ====================

export default function ProfilePage() {
  const { user } = useAuth();
  const { isAuthenticated } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documents, setDocuments] = useState<FotoItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    position: "",
    salary: "",
    workPlan: "",
  });

  // Загрузка данных профиля
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await EmployeesRequests.GetCurrentProfile();
        setProfileData(profile);

        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          middleName: profile.middleName || "",
          position: profile.position || "",
          salary: profile.salary?.toString() || "0",
          workPlan: profile.workPlan?.toString() || "",
        });

        setPhotoPreview(profile.userFotoUrl);

        if (profile.documents && Array.isArray(profile.documents)) {
          const formattedDocs = profile.documents.map((doc: any) => ({
            name: doc.name || "document",
            base64: doc.base64 || ""
          }));
          setDocuments(formattedDocs);
        }
      } catch (err: any) {
        setError(err.message || "Ошибка загрузки профиля");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Обработчики
  const handleEditClick = () => {
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(profileData?.userFotoUrl || null);
    setFormData({
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      middleName: profileData.middleName || "",
      position: profileData.position || "",
      salary: profileData.salary?.toString() || "0",
      workPlan: profileData.workPlan?.toString() || "",
    });
    setError(null);
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

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveChanges = async () => {
    if (!profileData) return;

    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      let userFotoItem: FotoItem | null = null;

      if (photoFile) {
        const base64Photo = await convertFileToBase64(photoFile);
        userFotoItem = {
          name: photoFile.name,
          base64: base64Photo
        };
      }

      const workPlanValue = formData.workPlan
        ? (parseInt(formData.workPlan) as EnumWorkPlan)
        : null;

      const salaryValue = formData.salary ? parseFloat(formData.salary) : 0;

      const updateData = {
        userId: profileData.userId || user?.id,
        userFoto: userFotoItem,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        documents: documents,
        position: formData.position || null,
        salary: salaryValue,
        workPlan: workPlanValue
      };

      if (!updateData.userId) {
        throw new Error("Не указан userId");
      }

      const response = await AdminRequests.Update(updateData);

      setProfileData((prev: any) => ({
        ...prev,
        ...response,
        userFotoUrl: userFotoItem ? URL.createObjectURL(photoFile!) : prev.userFotoUrl
      }));

      setSuccessMessage("Профиль успешно обновлен");
      setIsEditing(false);
      setPhotoFile(null);

      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      console.error("Ошибка при обновлении:", err);
      setError(err.message || "Ошибка при обновлении профиля");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDocument = async (files: FileList | null) => {
    if (!files) return;

    const newDocs: FotoItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await convertFileToBase64(file);
      newDocs.push({
        name: file.name,
        base64: base64
      });
    }

    setDocuments(prev => [...prev, ...newDocs]);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Опции для графика работы
  const workPlanOptions = [
    { value: "", label: "Не указан" },
    ...Object.values(EnumWorkPlan)
      .filter(value => typeof value === "number")
      .map(value => ({
        value: String(value),
        label: getWorkPlanDisplayName(value as EnumWorkPlan)
      }))
  ];

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} redirectTo="/login">
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={isAuthenticated} redirectTo="/login">
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
          {/* Хедер */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
                  <p className="text-gray-600">Управление личной информацией</p>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <ActionButtons
                  isEditing={isEditing}
                  isSaving={isSaving}
                  onEditClick={handleEditClick}
                  onSaveClick={handleSaveChanges}
                  onCancelClick={handleCancelEdit}
                />
              </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className="max-w-6xl mx-auto">
            <MessageAlert
              type="error"
              message={error}
              icon={<XMarkIcon className="w-5 h-5" />}
            />

            <MessageAlert
              type="success"
              message={successMessage}
              icon={<CheckIcon className="w-5 h-5" />}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Левая колонка */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                  <ProfileAvatar
                    photoPreview={photoPreview}
                    isEditing={isEditing}
                    onPhotoClick={handlePhotoClick}
                    onFileChange={handleFileChange}
                    fileInputRef={fileInputRef}
                  />

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Основная информация</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600">Статус:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {getStatusDisplayName(profileData?.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600">Роль:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {getRoleDisplayName(profileData?.typeRole)}
                          </span>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              </div>

              {/* Правая колонка */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
                  {/* Личные данные */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-blue-100">
                      Личные данные
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        label="Фамилия"
                        name="lastName"
                        value={formData.lastName}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        onChange={handleInputChange}
                        placeholder="Введите фамилию"
                      />

                      <FormField
                        label="Имя"
                        name="firstName"
                        value={formData.firstName}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        onChange={handleInputChange}
                        placeholder="Введите имя"
                      />

                      <FormField
                        label="Отчество"
                        name="middleName"
                        value={formData.middleName}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        onChange={handleInputChange}
                        placeholder="Введите отчество"
                      />
                    </div>
                  </div>

                  {/* Рабочая информация */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-blue-100">
                      Рабочая информация
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="md:col-span-2 lg:col-span-2">
                        <FormField
                          label="Должность"
                          name="position"
                          value={formData.position}
                          isEditing={isEditing}
                          isSaving={isSaving}
                          onChange={handleInputChange}
                          placeholder="Введите должность"
                        />
                      </div>

                      <FormField
                        label="Зарплата"
                        name="salary"
                        value={formData.salary}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        type="number"
                        onChange={handleInputChange}
                        placeholder="0.00"
                        icon={<CurrencyDollarIcon className="w-5 h-5" />}
                      />

                      <div className="md:col-span-2 lg:col-span-3">
                        <FormField
                          label="График работы"
                          name="workPlan"
                          value={formData.workPlan}
                          displayValue={getWorkPlanDisplayName(Number(formData.workPlan) as EnumWorkPlan) || "Не указан"}
                          isEditing={isEditing}
                          isSaving={isSaving}
                          type="select"
                          options={workPlanOptions}
                          onChange={handleInputChange}
                        />
                      </div>



                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Права управления
                        </label>
                        <div className={`w-full px-4 py-3 ${profileData?.accessCanManage ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-800' : 'bg-gradient-to-r from-red-50 to-red-100 text-red-800'} rounded-xl font-medium`}>
                          {profileData?.accessCanManage ? "Есть права на управление" : "Нет прав на управление"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <DocumentsSection
                    documentUrls={profileData.documents}
                    documentItems={documents}
                    isEditing={isEditing}
                    onAddDocument={handleAddDocument}
                    onRemoveDocument={handleRemoveDocument}
                  />

                  <div className="pt-6 border-t border-blue-100">
                    <HistoryComponent
                      userId={user?.id ?? ""}
                      title="История изменений профиля"
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
                              {user?.id}
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
                            background: user?.login
                              ? "linear-gradient(135deg, #f0fff8, #e6fff0)"
                              : "linear-gradient(135deg, #fffcf0, #fff8e6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: user?.login ? "#48bb78" : "#ecc94b",
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
                                color: user?.login ? "#333" : "#aaa",
                                flex: 1
                              }}>
                                {user?.login || "Не указана"}
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
    </ProtectedRoute>
  );
}