"use client";
import { EnumUserRole } from "@/types/Enums"
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext"
import { AuthorizationRegistrationRequest } from "@/types/AuthorizationModels";
import { XMarkIcon, UserPlusIcon, ShieldCheckIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface InviteFormData {
  email: string;
  lastName: string;
  firstName: string;
  middleName: string;
  role: EnumUserRole,   // <-- всегда админ
  password: string,
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: InviteFormData) => void;
}

const PRIMARY_COLOR = "#2563eb";
const LIGHT_BLUE = "#dbeafe";
const HOVER_BLUE = "#1d4ed8";
const SUCCESS_COLOR = "#10b981";
const ERROR_COLOR = "#ef4444";

export default function InviteModal({
  isOpen,
  onClose,
  onInvite,
}: InviteModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    lastName: "",
    firstName: "",
    middleName: "",
    role: EnumUserRole.Admin,   // <-- всегда админ
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: "",
    type: 'success'
  });
  
  const { register } = useAuth();

  // Автоматически скрываем уведомление через 3 секунды
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      onInvite(formData);

      const registerRequest = await register({
        login: formData.email,
        lastName: formData.lastName,
        firstName: formData.firstName,
        middleName: formData.middleName,
        password: formData.password,
        userRole: EnumUserRole.Admin
      });

      // Показываем уведомление об успехе
      showNotification(
        `Администратор ${formData.firstName} ${formData.lastName} успешно добавлен!`,
        'success'
      );

      // Сбрасываем форму
      setFormData({
        email: "",
        lastName: "",
        firstName: "",
        middleName: "",
        role: EnumUserRole.Admin,
        password: "",
      });

      // Закрываем модальное окно через 1 секунду
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error: any) {
      // Показываем уведомление об ошибке
      const errorMessage = error?.message || "Произошла ошибка при добавлении администратора";
      showNotification(errorMessage, 'error');
      // Форма не закрывается при ошибке
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Уведомление */}
      {notification.show && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 2000,
          animation: "slideIn 0.3s ease-out"
        }}>
          <div style={{
            background: notification.type === 'success' ? SUCCESS_COLOR : ERROR_COLOR,
            color: "white",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: notification.type === 'success' 
              ? "0 8px 24px rgba(16, 185, 129, 0.3)"
              : "0 8px 24px rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "320px",
            maxWidth: "400px"
          }}>
            {notification.type === 'success' ? (
              <CheckCircleIcon style={{ width: "24px", height: "24px", flexShrink: 0 }} />
            ) : (
              <ExclamationCircleIcon style={{ width: "24px", height: "24px", flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <p style={{
                fontWeight: 600,
                margin: 0,
                fontSize: "16px"
              }}>
                {notification.type === 'success' ? 'Успешно!' : 'Ошибка!'}
              </p>
              <p style={{
                margin: "4px 0 0 0",
                fontSize: "14px",
                opacity: 0.9
              }}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <XMarkIcon style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}

      <div 
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 1000,
          backdropFilter: "blur(4px)",
        }}
        onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
      >
        <div style={{
          background: "white",
          borderRadius: "20px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          border: `1px solid ${LIGHT_BLUE}`
        }}>
          {/* Заголовок */}
          <div style={{
            background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #3b82f6)`,
            color: "white",
            padding: "24px",
            position: "relative"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <UserPlusIcon style={{ width: "24px", height: "24px" }} />
                </div>
                <div>
                  <h2 style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    margin: 0
                  }}>
                    Пригласить администратора
                  </h2>
                  <p style={{
                    fontSize: "14px",
                    opacity: 0.9,
                    marginTop: "4px"
                  }}>
                    Заполните данные нового администратора
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "10px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
              >
                <XMarkIcon style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
              {/* Фамилия */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  Фамилия *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: `1px solid ${LIGHT_BLUE}`,
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = PRIMARY_COLOR;
                    e.target.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = LIGHT_BLUE;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Имя */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  Имя *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: `1px solid ${LIGHT_BLUE}`,
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = PRIMARY_COLOR;
                    e.target.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = LIGHT_BLUE;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Отчество */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Отчество *
              </label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: `1px solid ${LIGHT_BLUE}`,
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = PRIMARY_COLOR;
                  e.target.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.1)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = LIGHT_BLUE;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: `1px solid ${LIGHT_BLUE}`,
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = PRIMARY_COLOR;
                  e.target.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.1)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = LIGHT_BLUE;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Роль (фиксированная) */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Роль *
              </label>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                background: LIGHT_BLUE,
                borderRadius: "10px",
                border: `1px solid ${PRIMARY_COLOR}`
              }}>
                <ShieldCheckIcon style={{ width: "20px", height: "20px", color: PRIMARY_COLOR }} />
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: PRIMARY_COLOR,
                    margin: 0
                  }}>
                    Администратор
                  </p>
                  <p style={{
                    fontSize: "12px",
                    color: "#4b5563",
                    margin: "4px 0 0 0"
                  }}>
                    Полный доступ ко всем функциям системы
                  </p>
                </div>
              </div>
            </div>

            {/* Пароль */}
            <div style={{ marginBottom: "32px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Пароль *
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Введите пароль для нового администратора"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: `1px solid ${LIGHT_BLUE}`,
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = PRIMARY_COLOR;
                  e.target.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.1)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = LIGHT_BLUE;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Кнопки */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "16px",
              paddingTop: "24px",
              borderTop: `1px solid ${LIGHT_BLUE}`
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  padding: "14px 28px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "16px",
                  transition: "all 0.2s",
                  minWidth: "120px"
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = "#e5e7eb";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = "#f3f4f6";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: "14px 28px",
                  background: PRIMARY_COLOR,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "16px",
                  transition: "all 0.2s",
                  minWidth: "120px",
                  opacity: isLoading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: `0 4px 12px rgba(37, 99, 235, 0.3)`
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = HOVER_BLUE;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(37, 99, 235, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = PRIMARY_COLOR;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: `2px solid rgba(255, 255, 255, 0.3)`,
                      borderTop: `2px solid white`,
                      animation: "spin 1s linear infinite"
                    }} />
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                    Отправка...
                  </>
                ) : (
                  <>
                    Отправить приглашение
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Подсказка */}
          <div style={{
            padding: "16px 32px 24px",
            background: LIGHT_BLUE,
            borderTop: `1px solid ${LIGHT_BLUE}`
          }}>
            <p style={{
              fontSize: "12px",
              color: "#4b5563",
              margin: 0,
              textAlign: "center"
            }}>
              ⓘ Новый администратор получит письмо с инструкциями для входа в систему
            </p>
          </div>
        </div>
      </div>
    </>
  );
}