
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { getChartData, type ChartData } from '@/lib/chart-data';
import { Skeleton } from '@/components/ui/skeleton';

const parseData = (data: string) => {
  if (!data) return [];
  return data
    .split('\n')
    .map(line => {
      const parts = line.split('=');
      if (parts.length !== 2) return null;
      const name = parts[0].trim();
      const value = parseFloat(parts[1].trim());
      if (!name || isNaN(value)) return null;
      return { name, target: value };
    })
    .filter(item => item !== null) as { name: string; target: number }[];
};


export function DynamicChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getChartData();
        if (data && data.targetData) {
          const parsed = parseData(data.targetData);
          setChartData(parsed);
        }
      } catch (error) {
        console.error("Gagal memuat data grafik:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (chartData.length === 0) {
    return <div className="text-center text-muted-foreground p-8">Data grafik tidak tersedia.</div>;
  }
  
  const CustomizedYAxisTick = ({ y, payload }: any) => {
    return (
      <g transform={`translate(0,${y})`}>
        <text x={0} y={0} dy={4} textAnchor="start" fill="#666" fontSize={12}>
           <tspan x="0">{payload.value.substring(0, 35)}</tspan>
            {payload.value.length > 35 && <tspan x="0" dy="15">{payload.value.substring(35)}</tspan>}
        </text>
      </g>
    );
  };


  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{
          top: 5,
          right: 30,
          left: 170, // Increased left margin for longer labels
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
            dataKey="name" 
            type="category" 
            width={150}
            tickLine={false}
            axisLine={false}
            tick={<CustomizedYAxisTick />}
        />
        <Tooltip
            contentStyle={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))"
            }}
        />
        <Legend />
        <Bar dataKey="target" name="Target Tahunan" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
           <LabelList dataKey="target" position="right" style={{ fill: 'hsl(var(--foreground))' }}/>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
