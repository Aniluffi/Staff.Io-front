import * as AdminModels from "@/types/AdminModels"
import { request } from "http";

const baseUrl = "http://localhost:53766/Admin";

export async function Delete(request: AdminModels.AdminDeleteRequest): Promise<boolean> {
    const result = await fetch(`${baseUrl}/Delete`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request),
        credentials: "include"
    });

    if (!result.ok) {
        const errorMsg = await result.json();
        throw new Error(errorMsg.message);
    }

    return await result.json();
}


export async function AddEmployee(request:AdminModels.AdminAddEmploeeRequest) : Promise<boolean> {
    var result = await fetch(baseUrl + "/AddEmployee",{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request),
        credentials:"include"
    });

    if(!result.ok){
        var errorMsg = await result.json();
        
        throw new Error(errorMsg.message);
    }

    return await result.json()
}

export async function Move(request:AdminModels.AdminMoveRequest) : Promise<boolean> {
    var result = await fetch(baseUrl + "/Move",{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request),
        credentials:"include"
    });

    if(!result.ok){
        var errorMsg = await result.json();
        
        throw new Error(errorMsg.message);
    }

    return await result.json()
}

export async function UpdateAccessCanManage(request:AdminModels.AdminUpdateAccessCanManageRequest) : Promise<AdminModels.AdminUpdateAccessCanManageResponse> {
    var result = await fetch(baseUrl + "/UpdateAccessCanManage",{
        method: "PATCH",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request),
        credentials:"include"
    });

    if(!result.ok){
        var errorMsg = await result.json();
        
        throw new Error(errorMsg.message);
    }

    return await result.json()
}

export async function Update(request:AdminModels.AdminUpdateRequest) : Promise<AdminModels.AdminUpdateResponse> {
    var result = await fetch(baseUrl + "/Update",{
        method: "PATCH",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request),
        credentials:"include"
    });

    if(!result.ok){
        var errorMsg = await result.json();
        
        throw new Error(errorMsg.message);
    }

    return await result.json()
}

export async function UpdateOwner(request:AdminModels.AdminUpdateOwnerRequest) : Promise<AdminModels.AdminUpdateOwnerResponse> {
    var result = await fetch(baseUrl + "/UpdateOwner",{
        method: "PATCH",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request),
        credentials:"include"
    });

    if(!result.ok){
        var errorMsg = await result.json();
        
        throw new Error(errorMsg.message);
    }

    return await result.json()
}