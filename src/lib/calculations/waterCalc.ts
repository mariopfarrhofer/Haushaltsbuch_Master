/**
 * Interfaces for the calculation functions
 */
export interface Reading {
  date: string | Date;
  value: number;
  [key: string]: any; // Allow for other properties like 'action'
}

export interface ConsumptionPeriod {
  periodStart: string | Date;
  periodEnd: string | Date;
  consumption: number;
}

export interface TrendResult {
  diff: number;
  percentage: number;
  isIncrease: boolean;
}

/**
 * Calculates the water consumption between consecutive readings.
 * 
 * @param readings An array of water readings
 * @returns An array of consumption data between the given readings
 */
export function calculateMonthlyConsumption(readings: Reading[]): ConsumptionPeriod[] {
  if (!readings || readings.length < 2) {
    return [];
  }

  // Sort readings chronologically to ensure accurate differences
  const sortedReadings = [...readings].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const consumptionPeriods: ConsumptionPeriod[] = [];

  for (let i = 1; i < sortedReadings.length; i++) {
    const previous = sortedReadings[i - 1];
    const current = sortedReadings[i];

    // Assuming value is cumulative (like a standard water meter)
    const consumptionAmount = current.value - previous.value;

    consumptionPeriods.push({
      periodStart: previous.date,
      periodEnd: current.date,
      // Round to 2 decimal places to avoid floating point errors
      consumption: Math.round(consumptionAmount * 100) / 100,
    });
  }

  return consumptionPeriods;
}

/**
 * Calculates the cost of a given water consumption amount.
 * 
 * @param consumption The amount of water consumed (e.g., in cubic meters)
 * @param tariff The cost per unit of water (e.g., currency per cubic meter)
 * @returns The total cost
 */
export function calculateCost(consumption: number, tariff: number): number {
  const cost = consumption * tariff;
  // Round to 2 decimal places representing standard currency formatting
  return Math.round(cost * 100) / 100;
}

/**
 * Calculates the trend between two periods (current vs previous).
 * 
 * @param current The current period's value (e.g., consumption or cost)
 * @param previous The previous period's value 
 * @returns An object containing the absolute difference, percentage change, and a boolean indicator
 */
export function getTrend(current: number, previous: number): TrendResult {
  if (previous === 0) {
    // Handle division by zero edge case if previous was 0
    const diff = current;
    return {
      diff: current,
      percentage: current > 0 ? 100 : 0,
      isIncrease: current > 0,
    };
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;

  return {
    // Round to 2 decimal places
    diff: Math.round(diff * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    isIncrease: diff > 0
  };
}
