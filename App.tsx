import React, { useState, useCallback, useEffect } from 'react';
import { StatusCard } from './components/StatusCard';
import { DataTask } from './types';
import ManagementPage from './components/ManagementPage';
import { MoonIcon, SunIcon } from './components/Icons';

// ข้อมูลเริ่มต้น (Mock Data)
const initialDataTasks: DataTask[] = [
  { id: 'sales', title: 'ข้อมูลการขาย', sqlQuery: 'SELECT MAX(sale_date) FROM sales;', lastUpdated: new Date(Date.now() - 86400000 * 2) },
  { id: 'inventory', title: 'ข้อมูลสินค้าคงคลัง', sqlQuery: 'SELECT MAX(stock_update_time) FROM inventory;', lastUpdated: new Date(Date.now() - 86400000 * 1) },
  { id: 'hr', title: 'ข้อมูลฝ่ายบุคคล', sqlQuery: 'SELECT MAX(last_modified) FROM employee_data;', lastUpdated: new Date(Date.now() - 86400000 * 5) },
  { id: 'finance', title: 'ข้อมูลการเงิน', sqlQuery: 'SELECT MAX(transaction_date) FROM finance_records;', lastUpdated: new Date() },
  { id: 'logistics', title: 'ข้อมูลโลจิสติกส์', sqlQuery: 'SELECT MAX(shipment_date) FROM logistics;', lastUpdated: null },
];

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<DataTask[]>(initialDataTasks);
  const [view, setView] = useState<'dashboard' | 'management'>('dashboard');
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleRefresh = useCallback(async (taskId: string) => {
    setLoadingTasks(prev => new Set(prev).add(taskId));
    // Simulate an API call based on the SQL query
    console.log(`Executing query for task ${taskId}: ${tasks.find(t => t.id === taskId)?.sqlQuery}`);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // 0.5s to 1.5s delay
    
    setTasks(prevTasks =>
        prevTasks.map(task =>
            task.id === taskId ? { ...task, lastUpdated: new Date() } : task
        )
    );

    setLoadingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
    });
  }, [tasks]);
  
  const handleAddTask = useCallback((newTaskData: Omit<DataTask, 'id' | 'lastUpdated'>) => {
    const newTask: DataTask = {
      ...newTaskData,
      id: `task_${Date.now()}`,
      lastUpdated: null,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, []);

  const handleUpdateTask = useCallback((updatedTask: DataTask) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);


  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              แดชบอร์ดสถานะข้อมูล RPA
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ตรวจสอบและจัดการสถานะข้อมูลล่าสุดจากระบบงานต่างๆ
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setView(v => v === 'dashboard' ? 'management' : 'dashboard')}
              className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-indigo-500 focus:ring-opacity-75 transition-colors duration-200"
            >
              {view === 'dashboard' ? 'จัดการประเภทข้อมูล' : 'กลับไปที่แดชบอร์ด'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-6 w-6 text-gray-800" />
              ) : (
                <SunIcon className="h-6 w-6 text-yellow-400" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tasks.map((task) => (
              <StatusCard 
                key={task.id} 
                title={task.title} 
                lastUpdated={task.lastUpdated}
                isLoading={loadingTasks.has(task.id)}
                onRefresh={() => handleRefresh(task.id)}
              />
            ))}
          </div>
        ) : (
          <ManagementPage
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </main>

      <footer className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
        <p>RPA Monitoring Dashboard © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;