
import { EnumUserRole } from "@/types/Enums"

export interface AuthorizationRegistrationRequest{
    login: string;
    password: string;
    firstName: string;
    middleName: string | null;
    lastName: string | null;
    userRole: EnumUserRole;
}

export interface AuthorizationLoginRequest{
    login : string;
    password: string;
}

export interface AuthorizationGetCurrentUserResponse{
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string | null;
    login: string;
    fotoUrl: string | null ;
    role: EnumUserRole,
    accessCanManage: boolean | null
}