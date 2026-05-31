'use client';

import React from 'react';
import {
    ComposedChart,
    Line,
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

const TOTAL_LINE_COLOR = '#111827';

const LINE_SERIES = [
    { key: 'iap' as const, label: 'In-App Purchase', color: '#10B981' },
    { key: 'subscription' as const, label: 'Subscription', color: '#6355FF' },
    { key: 'renewal' as const, label: 'Renewal', color: '#F59E0B' },
] as const;

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const formatChartDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string; dataKey?: string }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;

    const entries = [...payload].sort((a, b) => {
        if (a.dataKey === 'total') return -1;
        if (b.dataKey === 'total') return 1;
        return 0;
    });

    return (
        <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg">
            <p className="mb-2 text-sm font-medium text-gray-900">{formatChartDate(label ?? '')}</p>
            <div className="space-y-1">
                {entries
                    .filter(entry => entry.value > 0 || entry.dataKey === 'total')
                    .map(entry => (
                        <div key={entry.dataKey ?? entry.name} className="flex items-center justify-between gap-6 text-sm">
                            <span className="flex items-center gap-2 text-gray-600">
                                <span
                                    className={`inline-block ${entry.dataKey === 'total' ? 'h-0.5 w-4 rounded-full' : 'h-2.5 w-2.5 rounded-full'}`}
                                    style={{ backgroundColor: entry.color }}
                                />
                                {entry.name}
                            </span>
                            <span
                                className={`font-medium ${entry.dataKey === 'total' ? 'text-base font-semibold' : ''}`}
                                style={entry.dataKey === 'total' ? { color: TOTAL_LINE_COLOR } : { color: '#111827' }}
                            >
                                {formatCurrency(entry.value)}
                            </span>
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
        <div className="h-[300px] w-full rounded-xl bg-gradient-to-b from-gray-50/80 to-transparent px-1 pt-2">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
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
                        iconType="plainline"
                        iconSize={14}
                        wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                    />
                    {LINE_SERIES.map(series => (
                        <Line
                            key={series.key}
                            type="monotone"
                            dataKey={series.key}
                            name={series.label}
                            stroke={series.color}
                            strokeWidth={2}
                            dot={{ r: 3, fill: series.color, strokeWidth: 0 }}
                            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                            connectNulls
                            legendType="plainline"
                        />
                    ))}
                    <Line
                        type="monotone"
                        dataKey="total"
                        name="Total Revenue"
                        stroke={TOTAL_LINE_COLOR}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: TOTAL_LINE_COLOR, stroke: '#fff', strokeWidth: 2 }}
                        legendType="plainline"
                        connectNulls
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
