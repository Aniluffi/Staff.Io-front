"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import * as Employees from "@/requests/Employees";
import * as Admin from "@/requests/Admin";
import { EnumUserStatus } from "@/types/Enums";
import {
  EmployeesGetListItem,
  EmployeesGetListReqest
} from "@/types/EmployeesModels";
import Layout from "@/components/Layout";

import { AdminAddEmploeeRequest, AdminMoveRequest } from "@/types/AdminModels";

import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAuth } from "@/contexts/AuthContext";
import { GetCurrentUser } from "@/requests/Authorizations";

const PRIMARY_COLOR = "#2563eb";
const LIGHT_BLUE = "#dbeafe";
const HOVER_BLUE = "#1d4ed8";
const SUCCESS_COLOR = "#10b981";
const WARNING_COLOR = "#f59e0b";
const DANGER_COLOR = "#ef4444";

// Тип данных для DnD
const ItemTypes = {
  EMPLOYEE: "EMPLOYEE",
};

// --------------------------
// ДРАГ-ЭЛЕМЕНТ (СОТРУДНИК)
// --------------------------
function DraggableUser({
  user,
  children,
}: {
  user: EmployeesGetListItem;
  children: any;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EMPLOYEE,
    item: { userId: user.userId, isAdmin: user.isAdmin },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  return (
    <div
      ref={(el) => {
        if (el) drag(el);
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: user.isAdmin ? "default" : "grab",
        transition: "opacity 0.2s",
      }}
    >
      {children}
    </div>
  );
}

// --------------------------------
// DROP-ЗОНА (ТОЛЬКО ДЛЯ АДМИНОВ)
// --------------------------------
function AdminDropZone({
  admin,
  onMove,
  children,
  currentUserId
}: {
  admin: EmployeesGetListItem;
  onMove: (employeeId: string, newOwner: string) => void;
  children: any;
  currentUserId: string;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.EMPLOYEE,
    drop: (item: { userId: string }) => {
      onMove(item.userId, admin.userId);
    },
    canDrop: (item) => item.userId !== admin.userId && item.userId != currentUserId,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(el) => {
        if (el) drop(el);
      }}
      style={{
        border: isOver ? `2px dashed ${PRIMARY_COLOR}` : "none",
        borderRadius: "12px",
        padding: isOver ? "4px" : "0",
        transition: "all 0.2s",
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------
// НОДА ДЛЯ ДЕРЕВА (ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ КАК ПЛОЩАДКА ДЛЯ КОРНЯ)
// ---------------------------
function UserNode({
  node,
  level,
  onMove,
  onDelete,
  onRestore,
}: {
  node: EmployeesGetListItem;
  level: number;
  onMove: (userId: string, ownerId: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();

  // Проверяем, является ли текущая нода текущим пользователем
  const isCurrentUser = node.userId === user?.id;

  // Добавляем обработчики drag & drop для текущего пользователя
  const handleDropOnCurrentUser = (e: React.DragEvent) => {
    if (!isCurrentUser) return;

    e.preventDefault();
    const draggedUserId = e.dataTransfer.getData("text/plain");

    // Не позволяем перетаскивать самого себя
    if (draggedUserId === user?.id) {
      alert("Нельзя переместить сотрудника самого в себя");
      return;
    }

    // Для перемещения в корень передаем пустую строку
    onMove(draggedUserId, "");
  };

  const handleDragOverOnCurrentUser = (e: React.DragEvent) => {
    if (!isCurrentUser) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const indent = { marginLeft: level * 25 };

  // Рендерим площадку для текущего пользователя
  const currentUserPlatform = isCurrentUser ? (
    <div
      style={{
        padding: "30px 40px",
        borderRadius: "16px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.2))",
        border: `3px dashed ${PRIMARY_COLOR}`,
        boxShadow: "0 4px 20px rgba(37, 99, 235, 0.15)",
        transition: "all 0.3s",
        cursor: "pointer",
        position: "relative",
        ...indent,
      }}
      onDrop={handleDropOnCurrentUser}
      onDragOver={handleDragOverOnCurrentUser}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(37, 99, 235, 0.25))";
        e.currentTarget.style.border = `3px dashed ${HOVER_BLUE}`;
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(37, 99, 235, 0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.2))";
        e.currentTarget.style.border = `3px dashed ${PRIMARY_COLOR}`;
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(37, 99, 235, 0.15)";
      }}
    >
      {/* Иконка */}
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${PRIMARY_COLOR}, ${HOVER_BLUE})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
          marginRight: "20px",
          boxShadow: `0 4px 12px rgba(37, 99, 235, 0.3)`,
        }}
      >
        ↥
      </div>

      {/* Текст */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: "20px",
          fontWeight: 700,
          color: PRIMARY_COLOR,
          marginBottom: "8px"
        }}>
          Переместить в корень
        </div>
        <div style={{
          fontSize: "14px",
          color: "#4b5563",
          maxWidth: "400px"
        }}>
          Перетащите сотрудника сюда, чтобы сделать его корневым (без руководителя)
        </div>
      </div>
    </div>
  ) : null;

  // Обычная нода для остальных пользователей
  const regularContent = !isCurrentUser ? (
    <div
      style={{
        background: node.isAdmin ? LIGHT_BLUE : "white",
        padding: "16px 20px",
        borderRadius: "12px",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: node.isAdmin ? `2px solid ${PRIMARY_COLOR}` : `1px solid #e5e7eb`,
        boxShadow: "0 2px 8px rgba(37, 99, 235, 0.1)",
        transition: "all 0.2s",
        ...indent,
      }}
      onMouseEnter={(e) => {
        if (!node.isAdmin) {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (!node.isAdmin) {
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.1)";
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* стрелка */}
        <div
          style={{
            fontSize: "20px",
            cursor: node.items?.length ? "pointer" : "default",
            opacity: node.items?.length ? 1 : 0.3,
            color: PRIMARY_COLOR,
            transition: "transform 0.2s",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
          onClick={() => node.items?.length && setOpen(!open)}
        >
          ▼
        </div>

        {/* аватар */}

        {node.fotoUrl ? (
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: `2px solid ${PRIMARY_COLOR}`,
              overflow: "hidden",
              position: "relative",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
              transition: "all 0.2s",
            }}
            onClick={() => setOpen(!open)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.2)";
            }}
          >
            <img
              src={node.fotoUrl}
              alt={`${node.firstName} ${node.lastName}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
              onError={(e) => {
                // Если фото не загрузилось, показываем аватар
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement("div");
                  fallback.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, ${PRIMARY_COLOR}, #3b82f6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: bold;
          `;
                  fallback.textContent = `${node.firstName?.[0] || ''}${node.lastName?.[0] || ''}`;
                  parent.appendChild(fallback);
                }
              }}
            />
            {/* Индикатор онлайн статуса */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: node.status === EnumUserStatus.Active ? SUCCESS_COLOR : "#6b7280",
                border: "2px solid white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: `2px solid ${PRIMARY_COLOR}`,
              background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #3b82f6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
            }}
            onClick={() => setOpen(!open)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.background = `linear-gradient(135deg, ${HOVER_BLUE}, #2563eb)`;
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = `linear-gradient(135deg, ${PRIMARY_COLOR}, #3b82f6)`;
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.2)";
            }}
          >
            {node.firstName?.[0]}{node.lastName?.[0]}

            {/* Индикатор онлайн статуса */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: node.status === EnumUserStatus.Active ? SUCCESS_COLOR : "#6b7280",
                border: "2px solid white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        )}


        <div>
          <Link
            href={`/employees/${node.userId}`}
            style={{
              fontWeight: 600,
              color: PRIMARY_COLOR,
              cursor: "pointer",
              textDecoration: "none",
              fontSize: "18px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = HOVER_BLUE}
            onMouseLeave={(e) => e.currentTarget.style.color = PRIMARY_COLOR}
          >
            <div style={{
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              {node.firstName} {node.middleName} {node.lastName}
            </div>
          </Link>

          <div style={{
            color: "#6b7280",
            fontSize: "14px",
            marginTop: "4px"
          }}>
            Зарплата: <span style={{ fontWeight: 600 }}>{node.salary?.toLocaleString('ru-RU') || 0} ₽</span>
          </div>
        </div>

        {/* бейдж АДМИН */}
        {node.isAdmin && (
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              background: PRIMARY_COLOR,
              color: "white",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              boxShadow: `0 2px 4px rgba(37, 99, 235, 0.3)`,
            }}
          >
            Администратор
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            background: node.status === EnumUserStatus.Active ? SUCCESS_COLOR : WARNING_COLOR,
            color: "white",
            fontWeight: 600,
            fontSize: "14px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {node.status === EnumUserStatus.Active ? "АКТИВЕН" : "УВОЛЕН"}
        </div>

        {(user?.accessCanManage ?? false) &&
          (node.status === EnumUserStatus.Active ? (
            <button
              onClick={() => onDelete(node.userId)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: DANGER_COLOR,
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                transition: "all 0.2s",
                boxShadow: `0 2px 4px rgba(239, 68, 68, 0.3)`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DANGER_COLOR}
            >
              Уволить
            </button>
          ) : (
            <button
              onClick={() => onRestore(node.userId)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: SUCCESS_COLOR,
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                transition: "all 0.2s",
                boxShadow: `0 2px 4px rgba(16, 185, 129, 0.3)`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#059669"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = SUCCESS_COLOR}
            >
              Вернуть
            </button>
          ))
        }
      </div>
    </div>
  ) : null;

  // Обертка для обычного пользователя
  const wrappedRegularContent = !isCurrentUser ? (
    node.isAdmin ? (
      <AdminDropZone admin={node} onMove={onMove} currentUserId={user?.id ?? ""}>
        <DraggableUser user={node}>{regularContent}</DraggableUser>
      </AdminDropZone>
    ) : (
      <DraggableUser user={node}>{regularContent}</DraggableUser>
    )
  ) : null;

  // Обертка для площадки текущего пользователя
  const wrappedCurrentUserPlatform = isCurrentUser ? (
    node.isAdmin ? (
      <AdminDropZone admin={node} onMove={onMove} currentUserId={user?.id ?? ""}>
        {/* Текущий пользователь не должен быть перетаскиваемым, только принимающим */}
        <div>{currentUserPlatform}</div>
      </AdminDropZone>
    ) : (
      // Текущий пользователь не должен быть перетаскиваемым, только принимающим
      <div>{currentUserPlatform}</div>
    )
  ) : null;

  // Дети (для всех пользователей, включая текущего)
  const children = open && node.items?.map((c) => (
    <UserNode
      key={c.userId}
      node={c}
      level={isCurrentUser ? level : level + 1} // Для детей текущего пользователя не увеличиваем уровень
      onMove={onMove}
      onDelete={onDelete}
      onRestore={onRestore}
    />
  ));

  return (
    <div>
      {/* Площадка для текущего пользователя или обычная нода */}
      {wrappedCurrentUserPlatform || wrappedRegularContent}

      {/* Дети отображаются после площадки */}
      {children}
    </div>
  );
}
// -----------------------------
// ГЛАВНЫЙ ЭКРАН
// -----------------------------
export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EnumUserStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<EmployeesGetListItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
  });

  const { user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await Employees.GetList({
        Search: search,
        Status: status,
      });
      setItems(r.items);
    } catch {

    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  // Увольнение
  async function fire(userId: string) {
    await Admin.Delete({ userId });
    load();
  }

  // Добавить сотрудника
  async function addEmployee() {
    await Admin.AddEmployee({
      userId: null,
      firstName: newUser.firstName,
      middleName: newUser.middleName,
      lastName: newUser.lastName,
    });

    setShowAdd(false);
    setNewUser({ firstName: "", middleName: "", lastName: "" });
    load();
  }

  // Вернуть сотрудника
  async function restore(userId: string) {
    await Admin.AddEmployee({
      userId,
      firstName: "",
      middleName: "",
      lastName: "",
    });
    load();
  }

  // Перемещение
  async function move(userId: string, ownerId: string) {
    await Admin.Move({ userId, ownerId });
    load();
  }

  const admins = items.filter((i) => i.isAdmin);
  const workers = items.filter((i) => !i.isAdmin);

  return (
    <Layout>
      <DndProvider backend={HTML5Backend}>
        <div style={{
          padding: "32px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {/* Заголовок и фильтры */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
              padding: "24px",
              background: "white",
              borderRadius: "16px",
              border: `1px solid ${LIGHT_BLUE}`,
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
            }}
          >
            <div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: 0,
                marginBottom: "8px"
              }}>
                Сотрудники
              </h1>
            </div>

            {/* Кнопка добавления */}
            {user?.accessCanManage &&
              (<button
                onClick={() => setShowAdd(true)}
                style={{
                  padding: "12px 24px",
                  background: PRIMARY_COLOR,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "16px",
                  transition: "all 0.2s",
                  boxShadow: `0 4px 8px rgba(37, 99, 235, 0.3)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = HOVER_BLUE;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 12px rgba(37, 99, 235, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = PRIMARY_COLOR;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(37, 99, 235, 0.3)";
                }}
              >
                + Добавить сотрудника
              </button>)}

          </div>

          {/* Панель поиска и фильтров */}
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "24px",
              border: `1px solid ${LIGHT_BLUE}`,
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <input
              placeholder="Поиск по имени, фамилии..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${LIGHT_BLUE}`,
                width: "300px",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = PRIMARY_COLOR}
              onBlur={(e) => e.target.style.borderColor = LIGHT_BLUE}
            />

            <select
              value={status ?? ""}
              onChange={(e) =>
                setStatus(e.target.value === "" ? null : Number(e.target.value))
              }
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${LIGHT_BLUE}`,
                background: "white",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = PRIMARY_COLOR}
              onBlur={(e) => e.target.style.borderColor = LIGHT_BLUE}
            >
              <option value="">Все статусы</option>
              <option value={EnumUserStatus.Active}>Активные</option>
              <option value={EnumUserStatus.Deactivated}>Уволенные</option>
            </select>
          </div>

          {loading ? (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px"
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
          ) : (
            <>
              {/* Секция администраторов */}
              {admins.length > 0 && (
                <div style={{ marginBottom: "32px" }}>
                  {admins.map((a) => (
                    <UserNode
                      key={a.userId}
                      node={a}
                      level={0}
                      onMove={move}
                      onDelete={fire}
                      onRestore={restore}
                    />
                  ))}
                </div>
              )}

              {/* Секция сотрудников */}
              {workers.length > 0 && (
                <div>
                  {workers.map((w) => (
                    <UserNode
                      key={w.userId}
                      node={w}
                      level={0}
                      onMove={move}
                      onDelete={fire}
                      onRestore={restore}
                    />
                  ))}
                </div>
              )}

              {/* Если нет сотрудников */}
              {items.length === 0 && !loading && (
                <div style={{
                  textAlign: "center",
                  padding: "48px",
                  background: "white",
                  borderRadius: "12px",
                  border: `1px solid ${LIGHT_BLUE}`
                }}>
                  <div style={{
                    fontSize: "48px",
                    color: LIGHT_BLUE,
                    marginBottom: "16px"
                  }}>
                    👥
                  </div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "8px"
                  }}>
                    Нет сотрудников
                  </h3>
                  <p style={{
                    color: "#6b7280",
                    marginBottom: "24px"
                  }}>
                    Добавьте первого сотрудника, нажав кнопку выше
                  </p>

                  {user?.accessCanManage &&

                    (<button
                      onClick={() => setShowAdd(true)}
                      style={{
                        padding: "12px 24px",
                        background: PRIMARY_COLOR,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "16px"
                      }}
                    >
                      + Добавить сотрудника
                    </button>)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Модальное окно добавления сотрудника */}
        {showAdd && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
            onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
          >
            <div
              style={{
                background: "white",
                padding: "32px",
                borderRadius: "16px",
                width: "400px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                border: `1px solid ${LIGHT_BLUE}`,
              }}
            >
              <div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: 0,
                  marginBottom: "4px"
                }}>
                  Добавить сотрудника
                </h3>
                <p style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  margin: 0
                }}>
                  Заполните основные данные нового сотрудника
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  placeholder="Имя *"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${LIGHT_BLUE}`,
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = PRIMARY_COLOR}
                  onBlur={(e) => e.target.style.borderColor = LIGHT_BLUE}
                />

                <input
                  placeholder="Отчество"
                  value={newUser.middleName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, middleName: e.target.value })
                  }
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${LIGHT_BLUE}`,
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = PRIMARY_COLOR}
                  onBlur={(e) => e.target.style.borderColor = LIGHT_BLUE}
                />

                <input
                  placeholder="Фамилия *"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${LIGHT_BLUE}`,
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = PRIMARY_COLOR}
                  onBlur={(e) => e.target.style.borderColor = LIGHT_BLUE}
                />
              </div>

              <div style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px"
              }}>
                <button
                  onClick={addEmployee}
                  disabled={!newUser.firstName.trim() || !newUser.lastName.trim()}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    background: !newUser.firstName.trim() || !newUser.lastName.trim()
                      ? "#9ca3af"
                      : PRIMARY_COLOR,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: !newUser.firstName.trim() || !newUser.lastName.trim()
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: 600,
                    fontSize: "16px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (newUser.firstName.trim() && newUser.lastName.trim()) {
                      e.currentTarget.style.background = HOVER_BLUE;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newUser.firstName.trim() && newUser.lastName.trim()) {
                      e.currentTarget.style.background = PRIMARY_COLOR;
                    }
                  }}
                >
                  Добавить
                </button>

                <button
                  onClick={() => setShowAdd(false)}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    background: "#f3f4f6",
                    color: "#6b7280",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "16px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#e5e7eb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#f3f4f6"}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </DndProvider>
    </Layout>
  );
}
