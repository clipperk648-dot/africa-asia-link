
export const getShippingCountdownDays = (methodName: string): number => {
  switch (methodName.toLowerCase()) {
    case "sea":
    case "sea shipping":
    case "sea freight":
      return 60;
    case "air":
    case "air shipping":
    case "air freight":
      return 7;
    default:
      return 14;
  }
};

export const calculateExpectedDeliveryDate = (startedAt: string, methodName: string): Date => {
  const days = getShippingCountdownDays(methodName);
  const date = new Date(startedAt);
  date.setDate(date.getDate() + days);
  return date;
};

export const formatCountdown = (endDate: Date): string => {
  const now = new Date().getTime();
  const distance = endDate.getTime() - now;

  if (distance < 0) {
    return "Delivered";
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};
