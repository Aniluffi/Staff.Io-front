import * as AnalyticsModels from "@/types/AnalyticsModels"

var baseUrl = "http://localhost:53766/Analytics";

export async function Get(request: AnalyticsModels.AnalyticsGetRequest)
    : Promise<AnalyticsModels.AnalyticsGetResponse> {
    
    const params = {
        DateStart: new Date(request.DateStart).toISOString(),
        DateEnd: new Date(request.DateEnd).toISOString()
    };

    const query = new URLSearchParams(params).toString();

    const result = await fetch(`${baseUrl}/Get?${query}`, {
        method: "GET",
        credentials: "include"
    });

    if (!result.ok) {
        const errorMsg = await result.json();
        throw new Error(errorMsg.message);
    }

    return await result.json();
}
