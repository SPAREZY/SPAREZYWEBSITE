export type CartPart = { name: string; qty: number };

export type CartItem = {
  vin: string;
  make: string;
  model: string;
  year: string;
  parts: CartPart[];
  photo?: string; // data URL of the registration card photo (optional)
};

export type CheckoutData = {
  name: string;
  email: string;
  phone: string;
  wa: string;
  country: string;
  city: string;
  pref: string; // "WhatsApp" | "Phone call" | "Email"
  address: string;
  notes: string;
};

export type OrderRecap = {
  humanIds: string[];
  vehicles: CartItem[];
  name: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  address: string;
  notes: string;
  waLink: string;
};

export function carLabel(it: { make: string; model: string; year: string }): string {
  return [it.make, it.model, it.year].filter(Boolean).join(" ");
}
