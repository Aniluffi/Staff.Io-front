export enum EnumUserRole {
  Owner = 0,
  Admin = 1,
  Employee = 2
}

export enum EnumWorkPlan {
  FiveTwo = 1, // 5/2 (Пятидневная рабочая неделя)
  TwoTwo = 2, // 2/2 (Сменный график "два через два")
  ThreeThree = 3, // 3/3 (Сменный график "три через три")
  OneOne = 4, // 1/1 (Один рабочий, один выходной)
  SixOne = 5, // 6/1 (Шестидневная рабочая неделя)
  FourTwo = 6, // 4/2 (Четыре рабочих, два выходных)
  FourThree = 7, // 4/3 (Четыре рабочих, три выходных)
  ThreeOne = 8, // 3/1 (Три рабочих, один выходной)
}

export enum EnumUserStatus {
  //активный
  Active = 0,
  //уволенный
  Deactivated = 1
}

export enum EnumTypeHistory {
  /// Изменение зарплаты
  ChangeSalary = 1,
  /// Изменение фотографии профиля
  ChangeFotoProfile = 2,
  /// Изменение фамилии
  ChangeFirstName = 3,
  /// Изменение имени
  ChangeMiddleName = 4,
  /// Изменение отчества
  ChangeLastName = 5,
  /// Изменение должности
  ChangePosition = 6,
  /// Изменение отдела
  ChangeDepartment = 7, // ← смотри ниже
  /// Изменение рабочего графика
  ChangeWorkPlan = 8,
  /// Изменение фотографий документов
  ChangeFotoDocuments = 9,
  /// увольнение сотрудника
  Deleted = 10,
  /// Добавление сотрудника
  Add = 11,
  /// Изменение права на управление
  ChengeAccessCanManage = 12
}

export const getRoleDisplayName = (role: EnumUserRole): string => {
  switch (role) {
    case EnumUserRole.Admin:
      return "Админ";
    case EnumUserRole.Employee:
      return "Работник";
    case EnumUserRole.Owner:
      return "Владелец"; // или "Owner"
    default:
      return "Неизвестная роль"
  }
};

export const getStatusDisplayName = (role: EnumUserStatus | null): string => {
  switch (role) {
    case EnumUserStatus.Deactivated:
      return "Уволен";
    case EnumUserStatus.Active:
      return "На работе"; // или "Owner"
    default:
      return "Неизвестный статус..."
  }
};

export const getWorkPlanDisplayName = (plan: EnumWorkPlan | null): string => {
  if (!plan) return "Не указан";

  const planStr = plan;
  switch (planStr) {
    case EnumWorkPlan.FiveTwo:
      return "Пятидневная рабочая неделя";
    case EnumWorkPlan.FourTwo:
      return "Четыре рабочих, три выходных";
    case EnumWorkPlan.FourThree:
      return "Четыре рабочих, три выходных";
    case EnumWorkPlan.OneOne:
      return "Один рабочий, один выходной";
    case EnumWorkPlan.SixOne:
      return "Шестидневная рабочая неделя";
    case EnumWorkPlan.ThreeOne:
      return "Три рабочих, один выходной";
    case EnumWorkPlan.ThreeThree:
      return "Сменный график 'три через три'";
    case EnumWorkPlan.TwoTwo:
      return "Сменный график 'два через два'";
    default:
      return "Неизвестный график...";
  }
};

// Получаем текст для типа истории
export const getHistoryTypeText = (type: EnumTypeHistory): string => {
  switch (type) {
    case EnumTypeHistory.ChangeSalary:
      return "Изменена зарплата";
    case EnumTypeHistory.ChangeFotoProfile:
      return "Изменено фото профиля";
    case EnumTypeHistory.ChangeFirstName:
      return "Изменено имя";
    case EnumTypeHistory.ChangeMiddleName:
      return "Изменено отчество";
    case EnumTypeHistory.ChangeLastName:
      return "Изменена фамилия";
    case EnumTypeHistory.ChangePosition:
      return "Изменена должность";
    case EnumTypeHistory.ChangeDepartment:
      return "Изменен отдел";
    case EnumTypeHistory.ChangeWorkPlan:
      return "Изменен график работы";
    case EnumTypeHistory.ChangeFotoDocuments:
      return "Изменены фото документов";
    case EnumTypeHistory.Deleted:
      return "Удаление";
    case EnumTypeHistory.Add:
      return "Добавление";
    case EnumTypeHistory.ChengeAccessCanManage:
      return "Изменение прав управления";
    default:
      return "Изменение";
  }
};