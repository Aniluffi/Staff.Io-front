"use client";

import { useState, useEffect } from "react";
import { Get } from "@/requests/Analytics";
import {
  AnalyticsGetRequest,
  AnalyticsGetResponse,
} from "@/types/AnalyticsModels";
import Layout from "@/components/Layout";

const PRIMARY_COLOR = "#2563eb";
const LIGHT_BLUE = "#dbeafe";
const HOVER_BLUE = "#1d4ed8";
const SUCCESS_COLOR = "#10b981";
const DANGER_COLOR = "#ef4444";

export default function AnalyticsPage() {
  // --- Начальные даты ---
  const today = new Date().toISOString().split("T")[0];
  const firstDay = new Date();
  firstDay.setDate(1);
  const firstDayStr = firstDay.toISOString().split("T")[0];

  const [dateStart, setDateStart] = useState(firstDayStr);
  const [dateEnd, setDateEnd] = useState(today);
  const [data, setData] = useState<AnalyticsGetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const request: AnalyticsGetRequest = {
        DateStart: dateStart,
        DateEnd: dateEnd,
      };

      const response = await Get(request);
      setData(response);
    } catch (e: any) {
      setError(e.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  // --- Загрузка данных при первом открытии ---
  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout>
      <div style={{ 
        padding: "32px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Заголовок */}
        <div style={{
          marginBottom: "32px",
          paddingBottom: "20px",
          borderBottom: `2px solid ${LIGHT_BLUE}`
        }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: 0,
            marginBottom: "8px"
          }}>
            📊 Аналитика
          </h1>
          <p style={{
            color: "#6b7280",
            fontSize: "16px"
          }}>
            Статистика по сотрудникам и зарплатам за выбранный период
          </p>
        </div>

        {/* Фильтры */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "32px",
          border: `1px solid ${LIGHT_BLUE}`,
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
          maxWidth: "400px"
        }}>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: PRIMARY_COLOR
            }} />
            Выбор периода
          </h2>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4b5563",
                marginBottom: "8px"
              }}>
                Дата начала
              </label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
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

            <div>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4b5563",
                marginBottom: "8px"
              }}>
                Дата окончания
              </label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
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

            <button
              onClick={loadData}
              style={{
                padding: "14px 20px",
                background: PRIMARY_COLOR,
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "16px",
                transition: "all 0.2s",
                marginTop: "8px",
                boxShadow: `0 4px 8px rgba(37, 99, 235, 0.3)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = HOVER_BLUE;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style
                .boxShadow = "0 6px 12px rgba(37, 99, 235, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = PRIMARY_COLOR;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(37, 99, 235, 0.3)";
              }}
            >
              📈 Загрузить данные
            </button>

            {error && (
              <div style={{
                padding: "12px 16px",
                background: "#fee2e2",
                color: DANGER_COLOR,
                borderRadius: "8px",
                fontSize: "14px",
                marginTop: "12px",
                border: `1px solid ${DANGER_COLOR}`
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* Лоадер */}
        {loading && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
            background: "white",
            borderRadius: "16px",
            border: `1px solid ${LIGHT_BLUE}`
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              border: `4px solid ${LIGHT_BLUE}`,
              borderTop: `4px solid ${PRIMARY_COLOR}`,
              animation: "spin 1s linear infinite",
              marginBottom: "24px"
            }} />
            <p style={{
              color: "#6b7280",
              fontSize: "16px"
            }}>
              Загрузка аналитики...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Таблица с данными */}
        {data && !loading && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            border: `1px solid ${LIGHT_BLUE}`,
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)"
          }}>
            <div style={{
              padding: "24px",
              borderBottom: `1px solid ${LIGHT_BLUE}`,
              background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #3b82f6)`
            }}>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "white",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <span style={{ fontSize: "28px" }}>📊</span>
                Аналитические показатели
              </h2>
              <p style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "14px",
                marginTop: "8px"
              }}>
                Период: {new Date(dateStart).toLocaleDateString('ru-RU')} - {new Date(dateEnd).toLocaleDateString('ru-RU')}
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0
              }}>
                <thead>
                  <tr style={{
                    background: LIGHT_BLUE,
                    borderBottom: `1px solid ${LIGHT_BLUE}`
                  }}>
                    <th style={{
                      padding: "20px 24px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1f2937",
                      borderRight: `1px solid white`
                    }}>
                      #
                    </th>
                    <th style={{
                      padding: "20px 24px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1f2937",
                      borderRight: `1px solid white`
                    }}>
                      Метрика
                    </th>
                    <th style={{
                      padding: "20px 24px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1f2937"
                    }}>
                      Значение
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr style={{
                    borderBottom: `1px solid ${LIGHT_BLUE}`,
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: `1px solid ${LIGHT_BLUE}`
                    }}>
                      1
                    </td>
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1f2937",
                      borderRight: `1px solid ${LIGHT_BLUE}`
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #3b82f6)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white"
                        }}>
                          💰
                        </div>
                        Средняя зарплата (общая)
                      </div>
                    </td>
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: PRIMARY_COLOR
                    }}>
                      {data.averageSalary.toLocaleString("ru-RU")} ₽
                    </td>
                  </tr>

                  <tr style={{
                    borderBottom: `1px solid ${LIGHT_BLUE}`,
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: `1px solid ${LIGHT_BLUE}`
                    }}>
                      2
                    </td>
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1f2937",
                      borderRight: `1px solid ${LIGHT_BLUE}`
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: `linear-gradient(135deg, ${WARNING_COLOR}, #fbbf24)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white"
                        }}>
                          🔄
                        </div>
                        Коэффициент текучести (T/O)
                      </div>
                    </td>
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: data.turnoverRate > 10 ? DANGER_COLOR : WARNING_COLOR
                    }}>
                      {data.turnoverRate}%
                    </td>
                  </tr>

                  <tr style={{
                    borderBottom: `1px solid ${LIGHT_BLUE}`,
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: `1px solid ${LIGHT_BLUE}`
                    }}>
                      3
                    </td>
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1f2937",
                      borderRight: `1px solid ${LIGHT_BLUE}`
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: `linear-gradient(135deg, ${SUCCESS_COLOR}, #34d399)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white"
                        }}>
                          📈
                        </div>
                        Новые сотрудники
                      </div>
                    </td>
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: SUCCESS_COLOR
                    }}>
                      + {data.newEmployees} человек
                    </td>
                  </tr>

                  <tr style={{
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: `1px solid ${LIGHT_BLUE}`
                    }}>
                      4
                    </td>
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1f2937",
                      borderRight: `1px solid ${LIGHT_BLUE}`
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: `linear-gradient(135deg, ${DANGER_COLOR}, #f87171)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white"
                        }}>
                          📉
                        </div>
                        Уволенные сотрудники
                      </div>
                    </td>
                    <td style={{
                      padding: "20px 24px",
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: DANGER_COLOR
                    }}>
                      - {data.firedEmployees} человек
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Сводка */}
            <div style={{
              padding: "24px",
              background: LIGHT_BLUE,
              borderTop: `1px solid ${LIGHT_BLUE}`
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: PRIMARY_COLOR,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px"
                }}>
                  i
                </div>
                <p style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  margin: 0
                }}>
                  <strong>Чистый прирост сотрудников:</strong> {data.newEmployees - data.firedEmployees} человек
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Статистика пустая */}
        {!data && !loading && !error && (
          <div style={{
            textAlign: "center",
            padding: "48px",
            background: "white",
            borderRadius: "16px",
            border: `1px solid ${LIGHT_BLUE}`
          }}>
            <div style={{
              fontSize: "64px",
              color: LIGHT_BLUE,
              marginBottom: "16px"
            }}>
              📊
            </div>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "8px"
            }}>
              Нет данных для отображения
            </h3>
            <p style={{
              color: "#6b7280",
              marginBottom: "24px"
            }}>
              Выберите период и загрузите аналитику
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Дополнительная константа цвета
const WARNING_COLOR = "#f59e0b";