import { supabase } from "@/app/utils/supabaseClient";

// Taux de change: 1 USD = 140 GDS
export const USD_TO_GDS_RATE = 140;

export function convertToGourdes(usd: number): number {
  return usd * USD_TO_GDS_RATE;
}

export function formatGourdes(usd: number): string {
  return `${convertToGourdes(usd).toLocaleString('fr-HT')} GDS`;
}

export function calculateFinalPrice(basePrice: number) {
  let fee = 0;
  let feeType = '';
  if (basePrice < 50) {
    fee = 8;
    feeType = '$8 flat fee';
  } else if (basePrice < 100) {
    fee = 12;
    feeType = '$12 flat fee';
  } else if (basePrice < 200) {
    fee = 20;
    feeType = '$20 flat fee';
  } else {
    fee = basePrice * 0.2;
    feeType = '20% of price';
  }
  return basePrice + fee;
}

export function getPriceBreakdown(basePrice: number) {
  let fee = 0;
  let feeType = '';
  if (basePrice < 50) {
    fee = 8;
    feeType = '$8 flat fee';
  } else if (basePrice < 100) {
    fee = 12;
    feeType = '$12 flat fee';
  } else if (basePrice < 200) {
    fee = 20;
    feeType = '$20 flat fee';
  } else {
    fee = basePrice * 0.2;
    feeType = '20% of price';
  }
  return {
    base: basePrice,
    fee,
    feeType,
    total: basePrice + fee
  };
}

export const DEFAULT_US_ADDRESS = {
  name: "Up-to-date Electronic (Your Name)",
  address: "8333 NW 53rd St, Suite 450",
  city: "Doral",
  state: "FL",
  zip: "33166",
  country: "USA",
  phone: "+1 786-555-1234"
};
