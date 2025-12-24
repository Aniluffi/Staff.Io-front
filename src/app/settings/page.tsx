"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Portal from "@/components/Portal";
import InviteModal from "@/components/settings/InviteModal";
import { useAuth } from "@/contexts/AuthContext";
import { EnumUserRole } from "@/types/Enums";
import { EnvelopeIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

// Импортируем компоненты
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { UserInfoSection } from "@/components/settings/UserInfoSectionProps";
import { ActionButton } from "@/components/settings/ActionButton";

interface ExtendedUser {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  role?: EnumUserRole;
  foto?: string | null;
  [key: string]: any; // Для других свойств
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(user as ExtendedUser);

  const isOwner = user?.role === EnumUserRole.Owner;

  const handleLogout = () => {
    try {
      router.push("/login");
      logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleInvite = () => {
    setIsInviteModalOpen(true);
  };

  const handleUpdateUser = (data: { name?: string; foto?: string | null }) => {
    console.log("User updated:", data);
    
    setCurrentUser(prev => {
      if (!prev) return prev;
      
      const updatedUser: ExtendedUser = { ...prev };
      
      if (data.name) {
        const nameParts = data.name.split(' ');
        updatedUser.firstName = nameParts[0] || '';
        updatedUser.middleName = nameParts[1] || '';
        updatedUser.lastName = nameParts.slice(2).join(' ') || '';
      }
      
      if (data.foto !== undefined) {
        updatedUser.foto = data.foto; // Теперь типы совпадают
      }
      
      return updatedUser;
    });
  };

  const handleInviteSubmit = (data: any) => {
    console.log("Приглашение отправлено:", data);
    setIsInviteModalOpen(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Заголовок */}
          <SettingsHeader />

          {/* Карточка профиля */}
          <ProfileCard>
            <div className="flex flex-col items-center text-center">
              
              {/* Информация о пользователе с функцией редактирования */}
              <UserInfoSection 
                user={currentUser || user} 
                isOwner={isOwner} 
                onUpdate={handleUpdateUser}
              />

              {/* Кнопки действий */}
              <div className="mt-8 w-full max-w-md space-y-4">
                <ActionButton
                  onClick={handleInvite}
                  icon={<EnvelopeIcon className="w-5 h-5" />}
                  text="Пригласить сотрудника"
                  isPrimary
                  isOwnerOnly
                  isOwner={isOwner}
                />
                
                <ActionButton
                  onClick={handleLogout}
                  icon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
                  text="Выйти из системы"
                  isOwner={isOwner}
                />
              </div>
            </div>
          </ProfileCard>
        </div>

        {/* Модальное окно приглашения */}
        <Portal>
          <InviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            onInvite={handleInviteSubmit}
          />
        </Portal>
      </div>
    </Layout>
  );
}