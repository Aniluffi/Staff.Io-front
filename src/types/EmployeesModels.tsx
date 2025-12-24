
import { EnumUserRole, EnumUserStatus, EnumWorkPlan } from "@/types/Enums"

export interface EmployeesGetListReqest {
    //фильтр по статусам
    Status: EnumUserStatus | null;
    //поиск
    Search: string | null;
}

export interface EmployeesGetListResponse {
    //список пользоватлей
    items: EmployeesGetListItem[]
}

export interface EmployeesGetListItem {
    //номер пользователя
    userId: string;
    //статус
    status: EnumUserStatus;
    //номер владельца
    ownerId: string;
    //фамилия
    firstName: string;
    //имя
    middleName: string;
    //отчество
    lastName: string;
    //зарплата
    salary: number | null,
    // является ли админом
    isAdmin: boolean,
    accessCanManage: boolean | null,
    // дочернии пользователи
    items: EmployeesGetListItem[] | null,
    fotoUrl: string | null
}

export interface EmployeesGetDetailRequest {
    userId: string
}

export interface EmployeesGetDetailResponse {
    userId: string,
    userFotoUrl: string | null,
    status: EnumUserStatus,
    firstName: string,
    lastName: string,
    middleName: string,
    accessCanManage: boolean,
    documents: string[],
    position: string | null,
    typeRole: EnumUserRole,
    salary: number | null,
    workPlan: EnumWorkPlan | null,
    login: string
}

export interface EmployeesGetCurrentProfileResponse {
    userId: string,
    userFotoUrl: string | null,
    status: EnumUserStatus,
    firstName: string,
    lastName: string,
    middleName: string,
    accessCanManage: boolean | null,
    documents: string[],
    position: string | null,
    typeRole: EnumUserRole,
    salary: number | null,
    workPlan: EnumWorkPlan | null
}