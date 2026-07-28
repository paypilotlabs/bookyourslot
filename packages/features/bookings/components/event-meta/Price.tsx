import type { EventPrice } from "@calcom/features/bookings/types";
import { formatPrice } from "@calcom/lib/currencyConversions";

export const Price = ({ price, currency }: EventPrice) => {
  if (price === 0) return null;

  return <>{formatPrice(price, currency)}</>;
};
