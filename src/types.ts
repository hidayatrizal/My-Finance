export type Transaction = {
  id?: string;
  date: string; // ISO format: YYYY-MM-DD
  adultCount: number;
  childCount: number;
  adultPrice: number;
  childPrice: number;
  totalIncome: number;
  createdAt: number;
};

export type ServicePrices = {
  adult: number;
  child: number;
  targetIncome?: number;
};

export type MonthlyReport = {
  month: string; // YYYY-MM
  totalAdults: number;
  totalChildren: number;
  totalIncome: number;
  totalDaysRecorded: number;
};
