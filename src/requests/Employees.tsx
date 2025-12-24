"use client";
import * as EmployeesModels from "@/types/EmployeesModels"

var baseUrl = "http://localhost:53766/Employees";

export async function GetList(request: EmployeesModels.EmployeesGetListReqest)
    : Promise<EmployeesModels.EmployeesGetListResponse> {

    const params: Record<string, string> = {};

    if (request.Status !== undefined && request.Status !== null) {
        params.Status = request.Status.toString();
    }

    if (request.Search) {
        params.Search = request.Search;
    } else {
        params.Search = "";
    }

    const query = new URLSearchParams(params).toString();

    const result = await fetch(`${baseUrl}/GetList?${query}`, {
        method: "GET",
        credentials: "include"
    });

    if (!result.ok) {
        const errorMsg = await result.json();
        throw new Error(errorMsg.message);
    }

    return await result.json();
}

export async function GetDetail(request:EmployeesModels.EmployeesGetDetailRequest) : Promise<EmployeesModels.EmployeesGetDetailResponse> {

    const params = {
        UserId: request.userId
    }

    const query = new URLSearchParams(params).toString();

    const result = await fetch(`${baseUrl}/GetDetail?${query}`, {
        method: "GET",
        credentials: "include"
    });

    if (!result.ok) {
        const errorMsg = await result.json();
        throw new Error(errorMsg.message);
    }

    return await result.json();
}

export async function GetCurrentProfile() : Promise<EmployeesModels.EmployeesGetCurrentProfileResponse> {
    const result = await fetch(`${baseUrl}/GetCurrentProfile`, {
        method: "GET",
        credentials: "include"
    });

    if (!result.ok) {
        const errorMsg = await result.json();
        throw new Error(errorMsg.message);
    }

    return await result.json();
}