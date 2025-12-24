"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Редирект на главную, если пользователь уже авторизован
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/employees");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ login: email, password });
      // Редирект произойдет автоматически из-за useEffect выше
    } catch (ex: any) {
      setError(ex.message || "Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  // Показываем лоадер во время проверки авторизации
  if (authLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8fafc"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "4px solid #e5e7eb",
          borderTop: `4px solid #2563eb`,
          animation: "spin 1s linear infinite"
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        `}</style>
      </div>
    );
  }

  // Если пользователь уже авторизован, не рендерим форму
  if (user) {
    return null;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "440px",
        width: "100%",
        background: "white",
        borderRadius: "24px",
        padding: "40px",
        boxShadow: "0 20px 60px rgba(37, 99, 235, 0.1)",
        border: "1px solid #e0f2fe"
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "white",
            fontSize: "28px",
            fontWeight: "bold"
          }}>
            S
          </div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "8px"
          }}>
            Вход в систему
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#6b7280"
          }}>
            Введите ваши данные для входа
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.com"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
                transition: "all 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.boxShadow = "none";
              }}
              required
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
                transition: "all 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.boxShadow = "none";
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              color: "white",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: isLoading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(37, 99, 235, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderTop: "2px solid white",
                  animation: "spin 1s linear infinite"
                }} />
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                Вход...
              </>
            ) : (
              "Войти в систему"
            )}
          </button>
        </form>

        <div style={{ 
          textAlign: "center", 
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "1px solid #e5e7eb"
        }}>
          <p style={{
            fontSize: "14px",
            color: "#6b7280"
          }}>
            Нет учетной записи?{" "}
            <a 
              href="/register" 
              style={{
                color: "#2563eb",
                fontWeight: "600",
                textDecoration: "none"
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
            >
              Создать аккаунт
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}