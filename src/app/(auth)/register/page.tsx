"use client";

import { useState } from "react";
import * as AuthContext from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/ProtectedRoute";

export default function OwnerRegistration() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);

  const { register } = AuthContext.useAuth();

  const router = useRouter();

  const [isLoading ,setIsLoading] = useState(false);
  const [isAuthenticated] = useState(false);

  const registrationForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setIsLoading(true);
    setError(null);

    try{
      await register({
          login: formData.email,
          firstName: formData.companyName,
          middleName: null,
          lastName: null,
          password: formData.password,
          userRole: 0
       });


      router.push("/employees");
    }catch(ex: any){
      setError(ex.message);
    }finally{
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProtectedRoute requireAuth={isAuthenticated} redirectTo="/employees">
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Создание компании
          </h1>
          <p className="text-gray-600">Зарегистрируйте ваше ООО в системе</p>
        </div>

        <form onSubmit={registrationForm} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название компании *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="'Название компания'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="owner@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Минимум 8 символов"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подтвердите пароль *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2563EB] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Создание..." : "Создать компанию"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Уже есть компания?{" "}
            <a href="/login" className="text-[#2563EB] font-semibold">
              Войти
            </a>
          </p>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
