import * as ExpensesModels from "@/types/ExpensesModels";

const baseUrl = "http://localhost:53766/Expenses";

export async function Get() : Promise<ExpensesModels.ExpensesGetResponse> {
    var result = await fetch(baseUrl + "/Get",{
        method:"GET",
        credentials:"include"
    });

    if(!result.ok){
        var errorMsg = await result.json();
        throw new Error(errorMsg.message);
    }

    return await result.json();
}