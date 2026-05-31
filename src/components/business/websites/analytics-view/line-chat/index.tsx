'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

export interface RevenueChartDataPoint {
    date: string;
    iap: number;
    subscription: number;
    renewal: number;
    total: number;
}

interface RevenueChartProps {
    data: RevenueChartDataPoint[];
}

const SERIES = [
    { key: 'iap' as const, label: 'In-App Purchase', color: '#10B981', gradientId: 'iapGradient' },
    { key: 'subscription' as const, label: 'Subscription', color: '#6355FF', gradientId: 'subscriptionGradient' },
    { key: 'renewal' as const, label: 'Renewal', color: '#F59E0B', gradientId: 'renewalGradient' },
];

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const formatChartDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;

    const total = payload.reduce((sum, entry) => sum + (entry.value ?? 0), 0);

    return (
        <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg">
            <p className="mb-2 text-sm font-medium text-gray-900">{formatChartDate(label ?? '')}</p>
            <p className="mb-2 text-base font-semibold text-primary">{formatCurrency(total)}</p>
            <div className="space-y-1">
                {payload
                    .filter(entry => entry.value > 0)
                    .map(entry => (
                        <div key={entry.name} className="flex items-center justify-between gap-6 text-sm">
                            <span className="flex items-center gap-2 text-gray-600">
                                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}
                            </span>
                            <span className="font-medium text-gray-900">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    if (!data.length) {
        return (
            <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-sm text-gray-500">
                No revenue data for this period
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full rounded-xl bg-gradient-to-b from-primary/[0.03] to-transparent px-1 pt-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                    <defs>
                        {SERIES.map(series => (
                            <linearGradient key={series.gradientId} id={series.gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={series.color} stopOpacity={0.45} />
                                <stop offset="100%" stopColor={series.color} stopOpacity={0.05} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatChartDate}
                        dy={8}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={value => (value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`)}
                        width={56}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                    />
                    {SERIES.map(series => (
                        <Area
                            key={series.key}
                            type="monotone"
                            dataKey={series.key}
                            name={series.label}
                            stackId="revenue"
                            stroke={series.color}
                            strokeWidth={2}
                            fill={`url(#${series.gradientId})`}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
