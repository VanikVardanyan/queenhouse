export type House = "small" | "large";

export type Booking = {
  id: string;
  house: House;
  start_date: string;
  end_date: string;
  note: string | null;
  created_at: string;
};

export type BookingInsert = {
  house: House;
  start_date: string;
  end_date: string;
  note?: string | null;
};

export type BookingUpdate = {
  start_date?: string;
  end_date?: string;
  note?: string | null;
};

export const HOUSES: House[] = ["small", "large"];

export const ADMIN_EMAIL = "queenhouse.arm@gmail.com";
