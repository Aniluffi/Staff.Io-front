import * as Enums from   "@/types/Enums"
import * as HistoryModels from "@/types/HistoryModels"

const baseUrl = "http://localhost:53766/History";

export async function Get(request:HistoryModels.HistoryGetRequest) : Promise<HistoryModels.HistoryGetResponse> {

    const params = {
        UserId: request.UserId
    }

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