export interface ExpensesGetResponse {
    items: ExpensesGetListItem[],
    expensesSum: number
}

export interface ExpensesGetListItem {
    userId: string;
    fullName: string;
    salary: number;
    datePay: string;
    fotoUrl: string | null
}