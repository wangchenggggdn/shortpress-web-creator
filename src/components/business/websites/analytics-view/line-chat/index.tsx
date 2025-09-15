'use client';

import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
    date: string;
    revenue: number;
}

interface LineChartProps {
    data: ChartData[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
    return (
        <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={value => {
                            return value;
                        }}
                    />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} tickFormatter={value => `$${value.toFixed(2)}`} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '8px',
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Revenue']}
                        labelFormatter={label => {
                            return label;
                        }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#6355FF" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LineChart;
