import React, { useMemo } from 'react';
import { RefreshIcon, CalendarIcon, SpinnerIcon } from './Icons';

interface StatusCardProps {
  title: string;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, lastUpdated, onRefresh, isLoading }) => {
  const formattedDate = useMemo(() => {
    if (!lastUpdated) return 'ยังไม่มีข้อมูล';
    return lastUpdated.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [lastUpdated]);

  const formattedTime = useMemo(() => {
    if (!lastUpdated) return '-';
    return lastUpdated.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [lastUpdated]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl dark:shadow-gray-700/50 dark:hover:shadow-gray-700 transition-shadow duration-300 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 truncate">{title}</h2>
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 mb-6">
          <CalendarIcon className="w-8 h-8 text-indigo-500 flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-sm">ข้อมูลล่าสุด ณ วันที่:</p>
            <p className={`text-xl font-bold ${lastUpdated ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500'}`}>{formattedDate}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{lastUpdated ? `เวลา ${formattedTime} น.` : 'กรุณากดรีเฟรช'}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label={`รีเฟรชข้อมูล ${title}`}
        >
          {isLoading ? (
            <SpinnerIcon className="animate-spin h-5 w-5 -ml-1 mr-2" />
          ) : (
            <RefreshIcon className="h-5 w-5 -ml-1 mr-2" />
          )}
          {isLoading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
        </button>
      </div>
    </div>
  );
};