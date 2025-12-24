"use client";

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
  isPrimary?: boolean;
  isOwnerOnly?: boolean;
  isOwner: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  text,
  isPrimary = false,
  isOwnerOnly = false,
  isOwner
}) => {
  if (isOwnerOnly && !isOwner) return null;

  const baseClasses = "px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 w-full";
  
  if (isPrimary) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 hover:-translate-y-1`}
      >
        {icon}
        {text}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:-translate-y-1`}
    >
      {icon}
      {text}
    </button>
  );
};