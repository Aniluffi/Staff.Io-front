
export interface AnalyticsGetResponse {
    averageSalary: number;
    turnoverRate: number;
    newEmployees: number;
    firedEmployees: 0;
}

export interface AnalyticsGetRequest {
    DateStart: string;
    DateEnd: string;
}