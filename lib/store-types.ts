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
  state: string;
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
  state: string;
  country: string;
  address: string;
  notes: string;
  waLink: string;
};

export function carLabel(it: { make: string; model: string; year: string }): string {
  return [it.make, it.model, it.year].filter(Boolean).join(" ");
}

// What to show in place of the VIN when the customer uploaded a registration
// card photo instead of typing it.
export function vinLabel(it: { vin: string; photo?: string }): string {
  if (it.vin && it.vin.trim()) return it.vin;
  return it.photo ? "📷 VIN / CHASSIS PHOTO" : "";
}
