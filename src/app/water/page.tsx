"use client";

import React, { useEffect, useState } from 'react';
import { WaterChart } from '../../../components/water/WaterChart';
import { WaterForm } from '../../../components/water/WaterForm';
import { SupabaseService } from '../../../lib/services/supabaseClient';
import { calculateMonthlyConsumption, getTrend } from '../../../lib/calculations/waterCalc';

export default function WaterDashboard() {
  const [currentConsumption, setCurrentConsumption] = useState<number | null>(null);
  const [trend, setTrend] = useState<{ difference: number; percentage: number; isHigher: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const readings = await SupabaseService.getAll();
      if (readings && readings.length >= 2) {
        const consumptions = calculateMonthlyConsumption(readings as any);
        if (consumptions.length > 0) {
          // The last element represents the most recent interval's consumption
          const current = consumptions[consumptions.length - 1].consumption;
          setCurrentConsumption(current);

          // If we have at least two intervals, calculate the trend vs previous
          if (consumptions.length > 1) {
            const previous = consumptions[consumptions.length - 2].consumption;
            setTrend(getTrend(current, previous));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Water Dashboard
          </h1>
          <p className="text-base text-gray-500">
            Track and analyze your household water consumption over time.
          </p>
        </div>

        {/* KPI Cards Grid - Mobile First: 1 col, transforms to 2 on larger screens */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          
          {/* Current Consumption Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Current Period
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
              ) : (
                <>
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    {currentConsumption !== null ? currentConsumption : '--'}
                  </span>
                  <span className="text-xl font-medium text-gray-500">m³</span>
                </>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Volume used during the latest recorded interval.
            </p>
          </div>

          {/* Trend Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Vs. Last Period
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
              ) : trend ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-3xl font-bold tracking-tight ${
                        trend.isHigher ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {trend.isHigher ? '↑' : '↓'} {Math.abs(trend.percentage)}%
                    </span>
                  </div>
                  <span className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
                    {trend.difference > 0 ? '+' : ''}{trend.difference} m³ absolute change
                  </span>
                </div>
              ) : (
                <span className="text-xl font-medium text-gray-400">
                  Not enough historical data
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area - Form and Chart */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          
          {/* Interactive Form Side */}
          <div className="col-span-1 order-last lg:order-first">
            {/* We wrap the component to let it take 100% of this grid column width */}
            <div className="w-full">
              <WaterForm />
            </div>
            <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
              <span className="font-semibold block mb-1">💡 Pro Tip</span>
              Log your meter reading on the exact same day each month for the most accurate trend analysis.
            </div>
          </div>

          {/* Chart Display Side */}
          <div className="col-span-1 lg:col-span-2">
            {/* Added a custom wrapper to override internal styles if necessary and provide uniform card look */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-black ring-opacity-5">
              <WaterChart />
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
