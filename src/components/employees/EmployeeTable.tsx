"use client";

import { Employee } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onToggleStatus: (id: string) => void;
}

export default function EmployeeTable({
  employees = [],
  onEdit,
  onToggleStatus,
}: EmployeeTableProps) {
  const { hasPermission } = useAuth();
  const router = useRouter();

  const canEdit = hasPermission("admin");

  // Если нет данных, показываем заглушку
  if (!employees || employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">Нет сотрудников для отображения</p>
      </div>
    );
  }

  const formatSalary = (salary: number) => {
    return salary.toLocaleString("ru-RU") + " ₽";
  };

  const handleRowClick = (employee: Employee, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/employees/${employee.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ФИО
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Должность
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Отдел
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Зарплата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              {canEdit && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={(e) => handleRowClick(employee, e)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {employee.fullName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {employee.position}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {employee.department}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatSalary(employee.salary)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {employee.status === "active" ? "Работает" : "Уволен"}
                  </span>
                </td>
                {canEdit && (
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex space-x-3">
                      <button
                        onClick={() => onEdit(employee)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                        title="Редактировать"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Редактировать
                      </button>
                      <button
                        onClick={() => onToggleStatus(employee.id)}
                        className={`flex items-center ${
                          employee.status === "active"
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {employee.status === "active" ? "Уволить" : "Вернуть"}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
