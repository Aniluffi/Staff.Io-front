"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { EnumUserRole } from "@/types/Enums";

interface LayoutProps {
  children: React.ReactNode;
}

const PRIMARY_COLOR = "#2563eb";
const LIGHT_BLUE = "#dbeafe";
const HOVER_BLUE = "#1d4ed8";

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [windowHeight, setWindowHeight] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Получаем высоту окна при монтировании и ресайзе
    const updateHeight = () => {
      setWindowHeight(window.innerHeight);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Редирект на логин, если пользователь не авторизован
  useEffect(() => {
    if (!isLoading && !user && !isLoggingOut && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, isLoading, pathname, isLoggingOut, router]);

  // Навигация для всех авторизованных пользователей
  const navigation = [
    {
      name: "Профиль",
      href: "/dashboard",
      icon: HomeIcon,
      roles: [EnumUserRole.Admin],
    },
    {
      name: "Сотрудники",
      href: "/employees",
      icon: UsersIcon,
      roles: [EnumUserRole.Owner, EnumUserRole.Admin],
    },
    {
      name: "Аналитика",
      href: "/analytics",
      icon: ChartBarIcon,
      roles: [EnumUserRole.Owner],
    },
    {
      name: "Расходы",
      href: "/expenses",
      icon: CurrencyDollarIcon,
      roles: [EnumUserRole.Owner],
    },
    {
      name: "Настройки",
      href: "/settings",
      icon: CogIcon,
      roles: [EnumUserRole.Owner, EnumUserRole.Admin],
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Сначала делаем редирект на страницу логина
      router.push("/login");
      
      // Даем время для навигации
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Затем очищаем сессию
      await logout();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Фильтруем навигацию по ролям
  const filteredNavigation = user ? navigation.filter(
    (item) => item.roles.includes(user.role)
  ) : [];

  // Если идет загрузка или выход, показываем лоадер
  if (isLoading || isLoggingOut) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: LIGHT_BLUE
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: `4px solid ${LIGHT_BLUE}`,
          borderTop: `4px solid ${PRIMARY_COLOR}`,
          animation: "spin 1s linear infinite"
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Если нет пользователя, не рендерим layout
  if (!user) {
    return null;
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "#f8fafc"
    }}>
      {/* Боковая панель (FIXED) */}
      <div style={{
        width: "280px",
        background: "white",
        borderRight: `1px solid ${LIGHT_BLUE}`,
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 20px rgba(37, 99, 235, 0.08)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto"
      }}>
        {/* Логотип и название компании */}
        <div style={{
          padding: "28px 24px",
          background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #3b82f6)`,
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Декоративный элемент */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "150px",
            height: "150px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%"
          }} />
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            position: "relative",
            zIndex: 1
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
              <BuildingOfficeIcon style={{ width: "24px", height: "24px" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontSize: "18px",
                fontWeight: "bold",
                margin: 0,
                marginBottom: "4px"
              }}>
                ООО "Славка"
              </h1>
              <p style={{
                fontSize: "12px",
                opacity: 0.9,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <nav style={{ 
          flex: 1, 
          padding: "24px 16px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    background: isActive ? LIGHT_BLUE : "transparent",
                    border: isActive ? `1px solid ${PRIMARY_COLOR}` : `1px solid transparent`,
                    color: isActive ? PRIMARY_COLOR : "#4b5563",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#f3f4f6";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "4px",
                      height: "20px",
                      background: PRIMARY_COLOR,
                      borderRadius: "0 2px 2px 0"
                    }} />
                  )}
                  <Icon style={{ 
                    width: "20px", 
                    height: "20px",
                    marginRight: "12px",
                    color: isActive ? PRIMARY_COLOR : "#6b7280"
                  }} />
                  <span style={{
                    fontSize: "15px",
                    fontWeight: isActive ? "600" : "500"
                  }}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Информация о пользователе */}
        <div style={{
          padding: "20px 16px",
          borderTop: `1px solid ${LIGHT_BLUE}`,
          background: "#f8fafc"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px",
            marginBottom: "16px",
            padding: "12px",
            background: "white",
            borderRadius: "12px",
            border: `1px solid ${LIGHT_BLUE}`
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #3b82f6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              flexShrink: 0
            }}>
              {user.fotoUrl ? (
                <img
                  src={user.fotoUrl}
                  alt="Фото"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                />
              ) : (
                user.firstName?.[0] || "U"
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {user.firstName} {user.lastName}
              </p>
              <div style={{
                fontSize: "12px",
                color: PRIMARY_COLOR,
                background: LIGHT_BLUE,
                padding: "2px 8px",
                borderRadius: "20px",
                display: "inline-block",
                marginTop: "4px",
                fontWeight: "600"
              }}>
                {user.role === EnumUserRole.Owner
                  ? "Владелец"
                  : user.role === EnumUserRole.Admin
                    ? "Администратор"
                    : "Сотрудник"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "12px 16px",
              background: "white",
              color: "#ef4444",
              border: `1px solid #fee2e2`,
              borderRadius: "12px",
              cursor: isLoggingOut ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s",
              opacity: isLoggingOut ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.background = "#fee2e2";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <ArrowRightOnRectangleIcon style={{ 
              width: "18px", 
              height: "18px",
              marginRight: "8px"
            }} />
            {isLoggingOut ? "Выход..." : "Выйти из системы"}
          </button>
        </div>
      </div>

      {/* Основной контент (SCROLLABLE) */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        minHeight: "100vh",
        overflowY: "auto"
      }}>
        {/* Хедер (часть скроллируемого контента) */}
        <header style={{
          background: "white",
          borderBottom: `1px solid ${LIGHT_BLUE}`,
          padding: "0 32px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.05)",
          flexShrink: 0
        }}>
          <div>
            <h2 style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: 0
            }}>
              {filteredNavigation.find((item) => 
                item.href === pathname || 
                (item.href !== "/dashboard" && pathname?.startsWith(item.href))
              )?.name || "Главная панель"}
            </h2>
            <p style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: "4px 0 0 0"
            }}>
              Добро пожаловать в систему управления персоналом
            </p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{
              padding: "8px 16px",
              background: LIGHT_BLUE,
              borderRadius: "20px",
              border: `1px solid ${PRIMARY_COLOR}`
            }}>
              <p style={{
                fontSize: "14px",
                color: PRIMARY_COLOR,
                margin: 0,
                fontWeight: "500"
              }}>
                {user.login}
              </p>
            </div>
            
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: LIGHT_BLUE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PRIMARY_COLOR,
              fontSize: "20px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onClick={() => router.push("/settings")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              ⚙️
            </div>
          </div>
        </header>

        {/* Контент страницы */}
        <main style={{
          flex: 1,
          padding: "32px",
          background: "#f8fafc",
          minHeight: 0
        }}>
          <div style={{
            maxWidth: "1200px",
            margin: "0 auto"
          }}>
            {children}
          </div>
        </main>

        {/* Футер (часть скроллируемого контента) */}
        <footer style={{
          padding: "20px 32px",
          background: "white",
          borderTop: `1px solid ${LIGHT_BLUE}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0
        }}>
          <p style={{
            fontSize: "14px",
            color: "#6b7280",
            margin: 0
          }}>
            © {new Date().getFullYear()} ООО "Славка". Все права защищены.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="#" style={{
              fontSize: "14px",
              color: PRIMARY_COLOR,
              textDecoration: "none",
              fontWeight: "500"
            }}>
              Политика конфиденциальности
            </a>
            <a href="#" style={{
              fontSize: "14px",
              color: PRIMARY_COLOR,
              textDecoration: "none",
              fontWeight: "500"
            }}>
              Помощь
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}