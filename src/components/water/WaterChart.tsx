import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SupabaseService } from '../../lib/services/supabaseClient';
import { calculateMonthlyConsumption } from '../../lib/calculations/waterCalc';

export const WaterChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        // 1. Fetch all raw readings from database
        const readings = await SupabaseService.getAll();

        if (readings && readings.length >= 2) {
          // 2. Use our existing utility to parse out exact consumption per interval
          const consumptions = calculateMonthlyConsumption(readings as any);

          // 3. Format the data to fit Recharts standard structure
          const chartData = consumptions
            .map((c) => {
              const date = new Date(c.periodEnd);
              return {
                // Short month formatting e.g. "Jan '24"
                month: date.toLocaleDateString('en-US', {
                  month: 'short',
                  year: '2-digit',
                }),
                consumption: c.consumption,
              };
            })
            // 4. Slice nicely to only show the last rolling 12 months
            .slice(-12);

          setData(chartData);
        }
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  if (loading) {
    return (
      <div style={styles.stateContainer}>
        <p style={styles.stateText}>Loading chart data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={styles.stateContainer}>
        <p style={styles.stateText}>
          Not enough data to display the chart. Please add at least 2 readings.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Water Consumption (Last 12 Months)</h3>
      
      {/* ResponsiveContainer ensures the SVG shrinks/grows perfectly on mobile screens */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <defs>
            {/* The blue gradient definition */}
            <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number) => [`${value} m³`, 'Consumption']}
          />
          <Bar
            dataKey="consumption"
            fill="url(#colorBlue)"
            radius={[4, 4, 0, 0]}
            barSize={36}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Inline styles for pristine visual design regardless of external CSS scope
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box',
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },
  stateContainer: {
    width: '100%',
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: '16px',
    border: '1px dashed #e5e7eb',
  },
  stateText: {
    color: '#6b7280',
    fontSize: '15px',
    fontWeight: '500',
  },
};
