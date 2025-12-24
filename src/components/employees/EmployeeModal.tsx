"use client";

import { useState, useEffect } from "react";
import { Expense, ExpenseFormData } from "@/types";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExpenseFormData) => void;
  expense?: Expense | null;
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  expense,
}: ExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    employeeId: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "",
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        employeeId: expense.employeeId,
        amount: expense.amount,
        date: expense.date.toISOString().split("T")[0],
        description: expense.description || "",
        category: expense.category,
      });
    } else {
      setFormData({
        employeeId: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
        category: "",
      });
    }
  }, [expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    }));
  };

  // Мок-данные сотрудников
  const employees = [
    { id: "1", name: "Петров Алексей Иванович" },
    { id: "2", name: "Сидорова Мария Петровна" },
    { id: "3", name: "Иванов Иван Иванович" },
    { id: "4", name: "Козлова Анна Сергеевна" },
  ];

  const categories = [
    "Канцелярия",
    "Оборудование",
    "Программное обеспечение",
    "Маркетинг",
    "Командировки",
    "Обучение",
    "Прочие расходы",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {expense ? "Редактировать расход" : "Добавить расход"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сотрудник *
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите сотрудника</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сумма *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Описание расхода..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-blue-700"
              >
                {expense ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
