import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface DataChartProps {
  data: ChartData[];
}

const DataChart: React.FC<DataChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
          barSize={40}
        >
          <defs>
            <linearGradient id="colorUplift" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#C084FC" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#A8B2D1" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#A8B2D1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
          <Tooltip
            cursor={{ fill: 'rgba(0, 224, 255, 0.1)' }}
            contentStyle={{
              backgroundColor: '#161E39',
              borderColor: 'rgba(56, 75, 124, 0.5)',
              color: '#F0F4FF',
              borderRadius: '0.5rem',
            }}
          />
          <Legend wrapperStyle={{fontSize: "14px", color: '#F0F4FF'}} />
          <Bar dataKey="value" name="Uplift" fill="url(#colorUplift)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataChart;