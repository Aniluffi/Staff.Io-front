import { EnumUserRole, EnumUserStatus, EnumWorkPlan } from "./Enums"


export interface AdminDeleteRequest {
    //номер пользователя
    userId: string
}

export interface AdminAddEmploeeRequest {
    userId: string | null,
    firstName: string,
    middleName: string,
    lastName: string
}

export interface AdminUpdateAccessCanManageRequest {
    userId: string
}

export interface AdminUpdateAccessCanManageResponse {
    currentAccess: boolean
}

export interface AdminUpdateRequest {
    userId: string,
    userFoto: FotoItem | null,
    firstName: string,
    lastName: string,
    middleName: string,
    documents: FotoItem[],
    position: string | null,
    salary: number,
    workPlan: EnumWorkPlan | null
}

export interface FotoItem {
    name: string,
    base64: string
}

export interface AdminUpdateResponse {
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
    workPlan: EnumWorkPlan | null,
}

export interface AdminUpdateOwnerRequest {
    name: string,
    foto: FotoItem | null
}

export interface AdminUpdateOwnerResponse {
    foto: string | null
    name: string,
}

export interface AdminMoveRequest {
    //номер пользователя которого перемещают 
    userId: string,
    //номер админа к которому перемещают
    ownerId: string
}