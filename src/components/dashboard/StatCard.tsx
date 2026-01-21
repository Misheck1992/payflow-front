import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: LucideIcon;
  description?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'indigo';
  prefix?: string;
  suffix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  color = 'blue',
  prefix,
  suffix
}) => {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase': return 'text-emerald-600';
      case 'decrease': return 'text-red-600';
      case 'neutral': return 'text-muted-foreground';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return {
        iconBg: 'bg-blue-50 dark:bg-blue-950',
        iconColor: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-100 dark:border-blue-900'
      };
      case 'green': return {
        iconBg: 'bg-emerald-50 dark:bg-emerald-950',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-900'
      };
      case 'orange': return {
        iconBg: 'bg-orange-50 dark:bg-orange-950',
        iconColor: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-100 dark:border-orange-900'
      };
      case 'purple': return {
        iconBg: 'bg-purple-50 dark:bg-purple-950',
        iconColor: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-100 dark:border-purple-900'
      };
      case 'red': return {
        iconBg: 'bg-red-50 dark:bg-red-950',
        iconColor: 'text-red-600 dark:text-red-400',
        border: 'border-red-100 dark:border-red-900'
      };
      case 'indigo': return {
        iconBg: 'bg-indigo-50 dark:bg-indigo-950',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-100 dark:border-indigo-900'
      };
      default: return {
        iconBg: 'bg-slate-50 dark:bg-slate-950',
        iconColor: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-100 dark:border-slate-900'
      };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 hover:scale-105 ${colorClasses.border} border-l-4 group relative overflow-hidden`}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/30" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses.iconBg} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-5 w-5 ${colorClasses.iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        {change && (
          <p className={`text-xs font-medium ${getChangeColor(change.type)} flex items-center gap-1`}>
            {change.type === 'increase' && '↗'}
            {change.type === 'decrease' && '↘'}
            {change.value}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};