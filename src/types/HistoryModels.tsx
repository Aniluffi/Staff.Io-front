import *  as Enums from "@/types/Enums"

export interface HistoryGetResponse {
    items: HistoryGetResponseListItem[]
}


export interface HistoryGetRequest {
    UserId: string
}

export interface HistoryGetResponseListItem {
    type: Enums.EnumTypeHistory;
    fotoUrlUserCreated: string;
    fullNameUserCreated: string;
    value: string;  // любой тип!
    dateCreated:string
}