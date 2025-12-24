"use client";

import { useState, useEffect } from "react";
import { Get } from "@/requests/Expenses";
import {
  ExpensesGetResponse,
  ExpensesGetListItem,
} from "@/types/ExpensesModels";
import Layout from "@/components/Layout";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

const PRIMARY_COLOR = "#2563eb";
const LIGHT_BLUE = "#dbeafe";
const HOVER_BLUE = "#1d4ed8";

export default function ExpensesPage() {
  const [data, setData] = useState<ExpensesGetResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных с сервера
  useEffect(() => {
    async function loadExpenses() {
      try {
        const response = await Get();
        setData(response);
      } catch (e: any) {
        console.error("Ошибка загрузки расходов:", e.message);
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
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
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div style={{
          padding: "32px",
          textAlign: "center"
        }}>
          <div style={{
            padding: "24px",
            background: "#fee2e2",
            color: "#ef4444",
            borderRadius: "12px",
            border: "1px solid #ef4444",
            maxWidth: "500px",
            margin: "0 auto"
          }}>
            <p style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "8px"
            }}>
              ⚠️ Не удалось загрузить данные
            </p>
            <p style={{
              fontSize: "14px",
              color: "#7f1d1d"
            }}>
              Пожалуйста, попробуйте обновить страницу
            </p>
          </div>
        </div>
      </Layout>
    );
  }

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
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #3b82f6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}>
              💰
            </div>
            Расходы на зарплаты
          </h1>
          <p style={{
            color: "#6b7280",
            fontSize: "16px",
            marginLeft: "60px"
          }}>
            Ведомость выплат заработной платы сотрудникам
          </p>
        </div>

        {/* Карточка статистики */}
        <div style={{
          background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #3b82f6)`,
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "32px",
          color: "white",
          boxShadow: "0 8px 20px rgba(37, 99, 235, 0.3)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "20px"
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <CurrencyDollarIcon style={{
                  width: "32px",
                  height: "32px",
                  color: "white"
                }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  margin: 0,
                  marginBottom: "4px",
                  opacity: 0.9
                }}>
                  Суммарные расходы
                </h2>
                <p style={{
                  fontSize: "14px",
                  margin: 0,
                  opacity: 0.8
                }}>
                  Общая сумма выплат за период
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <p style={{
                fontSize: "40px",
                fontWeight: "bold",
                margin: 0,
                lineHeight: 1
              }}>
                {data.expensesSum.toLocaleString("ru-RU")} ₽
              </p>
              <p style={{
                fontSize: "14px",
                marginTop: "8px",
                opacity: 0.8
              }}>
                Всего записей: {data.items.length}
              </p>
            </div>
          </div>
        </div>

        {/* Таблица */}
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
            background: LIGHT_BLUE
          }}>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1f2937",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: PRIMARY_COLOR
              }} />
              Детализация выплат
            </h2>
            <p style={{
              color: "#6b7280",
              fontSize: "14px",
              marginTop: "8px"
            }}>
              Список всех выплат заработной платы сотрудникам
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
                  background: `linear-gradient(90deg, ${PRIMARY_COLOR}, #3b82f6)`,
                  color: "white"
                }}>
                  <th style={{
                    padding: "20px 24px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRight: `1px solid rgba(255, 255, 255, 0.2)`
                  }}>
                    #
                  </th>
                  <th style={{
                    padding: "20px 24px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRight: `1px solid rgba(255, 255, 255, 0.2)`
                  }}>
                    Ф.И.О сотрудника
                  </th>
                  <th style={{
                    padding: "20px 24px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRight: `1px solid rgba(255, 255, 255, 0.2)`
                  }}>
                    Сумма выплаты
                  </th>
                  <th style={{
                    padding: "20px 24px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}>
                    Дата выплаты
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.items.map((item: ExpensesGetListItem, index: number) => (
                  <tr
                    key={item.userId}
                    style={{
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
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: LIGHT_BLUE,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: PRIMARY_COLOR,
                        fontWeight: "bold"
                      }}>
                        {index + 1}
                      </div>
                    </td>

                    <td style={{
                      padding: "20px 24px",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1f2937",
                      borderRight: `1px solid ${LIGHT_BLUE}`
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {item.fotoUrl ? (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              border: `1px solid #f1f5f9`,
                              overflow: "hidden",
                              position: "relative",
                              flexShrink: 0
                            }}
                            title={item.fullName || "Сотрудник"}
                          >
                            <img
                              src={item.fotoUrl}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              background: `linear-gradient(135deg, ${LIGHT_BLUE}, #93c5fd)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: PRIMARY_COLOR,
                              fontWeight: "bold",
                              fontSize: "14px",
                              flexShrink: 0
                            }}
                            title={item.fullName || "Сотрудник"}
                          >
                            {item.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "??"}
                          </div>
                        )}

                        <span style={{
                          fontWeight: "500",
                          color: "#334155",
                          fontSize: "15px",
                          maxWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {item.fullName || "Не указано"}
                        </span>
                      </div>

                    </td>

                    <td style={{
                      padding: "20px 24px",
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: PRIMARY_COLOR,
                      borderRight: `1px solid ${LIGHT_BLUE}`
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          padding: "6px 12px",
                          background: LIGHT_BLUE,
                          borderRadius: "20px",
                          fontSize: "14px",
                          fontWeight: "600"
                        }}>
                          {item.salary.toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    </td>

                    <td style={{
                      padding: "20px 24px",
                      fontSize: "16px",
                      color: "#6b7280"
                    }}>
                      <div style={{
                        padding: "8px 16px",
                        background: "#f3f4f6",
                        borderRadius: "8px",
                        display: "inline-block",
                        fontWeight: "500"
                      }}>
                        📅 {new Date(item.datePay).toLocaleDateString("ru-RU", {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Итог */}
          <div style={{
            padding: "20px 24px",
            background: LIGHT_BLUE,
            borderTop: `1px solid ${LIGHT_BLUE}`
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <p style={{
                fontSize: "14px",
                color: "#4b5563",
                margin: 0
              }}>
                <strong>Итого выплат:</strong> {data.items.length} записей
              </p>
              <p style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: PRIMARY_COLOR,
                margin: 0
              }}>
                Сумма: {data.expensesSum.toLocaleString("ru-RU")} ₽
              </p>
            </div>
          </div>
        </div>

        {/* Статистика по месяцам (пример) */}
        {data.items.length > 0 && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            marginTop: "24px",
            border: `1px solid ${LIGHT_BLUE}`,
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)"
          }}>
            <h3 style={{
              fontSize: "18px",
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
              Краткая статистика
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px"
            }}>
              <div style={{
                padding: "16px",
                background: LIGHT_BLUE,
                borderRadius: "12px",
                border: `1px solid ${PRIMARY_COLOR}20`
              }}>
                <p style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  margin: 0,
                  marginBottom: "8px"
                }}>
                  Средняя выплата
                </p>
                <p style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: PRIMARY_COLOR,
                  margin: 0
                }}>
                  {(data.expensesSum / data.items.length).toLocaleString("ru-RU", {
                    maximumFractionDigits: 0
                  })} ₽
                </p>
              </div>

              <div style={{
                padding: "16px",
                background: LIGHT_BLUE,
                borderRadius: "12px",
                border: `1px solid ${PRIMARY_COLOR}20`
              }}>
                <p style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  margin: 0,
                  marginBottom: "8px"
                }}>
                  Максимальная выплата
                </p>
                <p style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: PRIMARY_COLOR,
                  margin: 0
                }}>
                  {Math.max(...data.items.map(i => i.salary)).toLocaleString("ru-RU")} ₽
                </p>
              </div>

              <div style={{
                padding: "16px",
                background: LIGHT_BLUE,
                borderRadius: "12px",
                border: `1px solid ${PRIMARY_COLOR}20`
              }}>
                <p style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  margin: 0,
                  marginBottom: "8px"
                }}>
                  Минимальная выплата
                </p>
                <p style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: PRIMARY_COLOR,
                  margin: 0
                }}>
                  {Math.min(...data.items.map(i => i.salary)).toLocaleString("ru-RU")} ₽
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Пустая таблица */}
        {data.items.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "48px",
            background: "white",
            borderRadius: "16px",
            border: `1px solid ${LIGHT_BLUE}`,
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)"
          }}>
            <div style={{
              fontSize: "64px",
              color: LIGHT_BLUE,
              marginBottom: "16px"
            }}>
              💸
            </div>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "8px"
            }}>
              Нет данных о выплатах
            </h3>
            <p style={{
              color: "#6b7280",
              marginBottom: "24px"
            }}>
              В выбранный период выплаты зарплат не производились
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}