
export const EXCHANGE_RATE = 1400;
export const CONSOLIDATION_FEE_NGN = 30 * EXCHANGE_RATE;
export const BATTERY_SURCHARGE_NGN = 80 * EXCHANGE_RATE;
export const NAFDAC_SURCHARGE_NGN = 35 * EXCHANGE_RATE;
export const BULK_DISCOUNT_THRESHOLD_CBM = 10;
export const BULK_DISCOUNT_AMOUNT_NGN = 5000;

export const DESTINATION_RATES: Record<string, number> = {
  aba_port_harcourt: 245 * 1400, // 343,000 NGN
  lagos: 210 * 1400,           // 294,000 NGN
  onitsha: 245 * 1400,         // 343,000 NGN
};

export const calculateUnitCBM = (lengthCm: number, widthCm: number, heightCm: number): number => {
  return (lengthCm * widthCm * heightCm) / 1000000;
};

export const calculateTotalCBM = (unitCBM: number, quantity: number): number => {
  return unitCBM * quantity;
};

export interface ShippingCostBreakdown {
  baseCost: number;
  consolidationFee: number;
  batterySurcharge: number;
  nafdacSurcharge: number;
  bulkDiscount: number;
  totalShippingCost: number;
}

export const calculateAirShippingCost = (weightKg: number): number => {
  return (weightKg * 5.5 * EXCHANGE_RATE) + (weightKg * 1200);
};

export const calculateSeaShippingCost = (
  cbm: number,
  destination: string,
  hasBattery: boolean = false,
  requiresNafdac: boolean = false,
  clusterTotalCBM: number = 0
): ShippingCostBreakdown => {
  const baseRate = DESTINATION_RATES[destination] || 0;
  const baseCost = cbm * baseRate;
  
  const consolidationFee = cbm * CONSOLIDATION_FEE_NGN;
  const batterySurcharge = hasBattery ? cbm * BATTERY_SURCHARGE_NGN : 0;
  const nafdacSurcharge = requiresNafdac ? cbm * NAFDAC_SURCHARGE_NGN : 0;
  
  const bulkDiscount = clusterTotalCBM > BULK_DISCOUNT_THRESHOLD_CBM 
    ? cbm * BULK_DISCOUNT_AMOUNT_NGN 
    : 0;

  const totalShippingCost = baseCost + consolidationFee + batterySurcharge + nafdacSurcharge - bulkDiscount;

  return {
    baseCost,
    consolidationFee,
    batterySurcharge,
    nafdacSurcharge,
    bulkDiscount,
    totalShippingCost,
  };
};

export const SHIPPING_DISCLAIMER = "Freight/Clearing Charge is very unstable. These rates are for estimate purposes. The accurate rate is solely determined after clearing.";
