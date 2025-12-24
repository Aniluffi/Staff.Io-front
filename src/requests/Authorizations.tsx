import * as AuthorizationModels from "@/types/AuthorizationModels";
import { json } from "stream/consumers";

const baseUrl = "http://localhost:53766/Authorization";

export async function Registration(request:AuthorizationModels.AuthorizationRegistrationRequest) : Promise<boolean> {
    var result = await fetch(baseUrl + "/Registration",{
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

export async function Logout() : Promise<boolean> {
    var result = await fetch(baseUrl + "/Logout",{
        method:"DELETE",
        credentials:"include"
    });

    if(!result.ok){
        var errorMsg = await result.json();
        
        throw new Error(errorMsg.message);
    }

    return await result.json();
}

export async function GetCurrentUser():Promise<AuthorizationModels.AuthorizationGetCurrentUserResponse> {
    var result = await fetch(baseUrl + "/GetCurrentUser",{
        method: "GET",
        credentials:"include"
    });

    if(!result.ok){
        var errorMsg = await result.json();
        
        throw new Error(errorMsg.message);
    }

    return await result.json();
}

export async function Login(request: AuthorizationModels.AuthorizationLoginRequest) : Promise<boolean>{
    var result = await fetch(baseUrl + "/Login",{
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

    return await result.json();
}