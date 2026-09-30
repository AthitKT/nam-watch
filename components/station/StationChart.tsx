/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useTranslations } from 'next-intl';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export function StationChart({ 
  data, 
  station 
}: { 
  data: any[]; 
  station: any;
}) {
  const t = useTranslations('station');
  const isPtt = station.type === 'watergate';

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-surface border border-dashed rounded-lg text-muted">
        {t('noData')}
      </div>
    );
  }

  // Formatting X Axis
  const formatXAxis = (tickItem: any) => {
    const date = new Date(tickItem);
    return format(date, 'HH:mm', { locale: th });
  };

  const formatTooltip = (value: any) => {
    const val = Number(value);
    return [`${val.toFixed(2)} ${station.unit}`, 'ระดับน้ำ'];
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="ts" 
            tickFormatter={formatXAxis} 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
            width={60}
          />
          <Tooltip 
            labelFormatter={(label: any) => {
              const d = new Date(label);
              return isNaN(d.getTime()) ? label : format(d, 'd MMM yyyy HH:mm', { locale: th });
            }}
            formatter={formatTooltip}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />

          {/* Reference Lines */}
          {!isPtt && station.bank_level !== null && (
            <ReferenceLine y={station.bank_level} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: t('bankLevel'), fill: '#EF4444', fontSize: 10 }} />
          )}
          {!isPtt && station.warning_level !== null && (
            <ReferenceLine y={station.warning_level} stroke="#F59E0B" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: t('thresholdWarning'), fill: '#F59E0B', fontSize: 10 }} />
          )}
          {!isPtt && station.critical_level !== null && (
            <ReferenceLine y={station.critical_level} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: t('thresholdCritical'), fill: '#EF4444', fontSize: 10 }} />
          )}

          {isPtt ? (
            <>
              <Line 
                name={t('gateIn')}
                type="monotone" 
                dataKey="level" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                name={t('gateOut')}
                type="monotone" 
                dataKey="level_out" 
                stroke="#1B4F9C" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4 }}
              />
            </>
          ) : (
            <Line 
              name={t('currentLevel')}
              type="monotone" 
              dataKey="level" 
              stroke="#3B82F6" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
