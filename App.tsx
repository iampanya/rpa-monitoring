import React, { useState, useCallback, useEffect } from 'react';
import { StatusCard } from './components/StatusCard';
import { DataTask } from './types';
import ManagementPage from './components/ManagementPage';
import { MoonIcon, SunIcon, SpinnerIcon } from './components/Icons';
import { supabase, isSupabaseConfigured } from './supabaseClient';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<DataTask[]>([]);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
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

  const fetchTasks = async () => {
    if (!isSupabaseConfigured) {
      setIsAppLoading(false);
      return;
    }

    setIsAppLoading(true);
    const { data, error } = await supabase
      .from('rpa_tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      // Don't alert immediately on load, just log it. Alert only on user actions usually better UX.
    } else if (data) {
      const tasksWithState = data.map(task => ({ ...task, lastUpdated: null }));
      setTasks(tasksWithState);
    }
    setIsAppLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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
  
  const handleAddTask = useCallback(async (newTaskData: Omit<DataTask, 'id' | 'lastUpdated' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('rpa_tasks')
      .insert({ title: newTaskData.title, sqlQuery: newTaskData.sqlQuery })
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล: ' + error.message);
    } else if (data) {
      const newTaskWithState: DataTask = { ...data, lastUpdated: null };
      setTasks(prevTasks => [...prevTasks, newTaskWithState]);
    }
  }, []);

  const handleUpdateTask = useCallback(async (updatedTask: Omit<DataTask, 'lastUpdated' | 'created_at'>) => {
    const { error } = await supabase
      .from('rpa_tasks')
      .update({ title: updatedTask.title, sqlQuery: updatedTask.sqlQuery })
      .eq('id', updatedTask.id);

    if (error) {
      console.error('Error updating task:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + error.message);
    } else {
      setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? { ...task, title: updatedTask.title, sqlQuery: updatedTask.sqlQuery } : task));
    }
  }, []);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    const { error } = await supabase
      .from('rpa_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message);
    } else {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }
  }, []);

  const renderContent = () => {
    // Check for Supabase Configuration first
    if (!isSupabaseConfigured) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-8 max-w-2xl w-full shadow-md">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-800 mb-4">
              <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ไม่พบการตั้งค่าฐานข้อมูล (Configuration Missing)
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              กรุณาตั้งค่า <code>VITE_SUPABASE_URL</code> และ <code>VITE_SUPABASE_ANON_KEY</code> ในไฟล์ <code>.env</code> ของคุณเพื่อเริ่มต้นใช้งาน
            </p>
            <div className="text-left bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm font-mono text-gray-700 dark:text-gray-400 mb-4">
              VITE_SUPABASE_URL="https://your-project.supabase.co"<br/>
              VITE_SUPABASE_ANON_KEY="your-anon-key"
            </div>
          </div>
        </div>
      );
    }

    if (isAppLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <SpinnerIcon className="animate-spin h-12 w-12 mb-4 text-indigo-500" />
          <p className="text-lg">กำลังโหลดข้อมูลจากฐานข้อมูล...</p>
        </div>
      );
    }

    if (view === 'dashboard') {
      if (tasks.length === 0) {
        return (
           <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                <SunIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">ยังไม่มีข้อมูล Monitor</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                ระบบยังไม่มีรายการตรวจสอบข้อมูล RPA กรุณาเพิ่มรายการใหม่ในหน้าจัดการ
              </p>
              <button
                onClick={() => setView('management')}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ไปที่หน้าจัดการ
              </button>
           </div>
        );
      }
      return (
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
      );
    }
    return (
      <ManagementPage
        tasks={tasks}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
    );
  };


  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              แดชบอร์ดสถานะข้อมูล RPA
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              ตรวจสอบและจัดการสถานะข้อมูลล่าสุดจากระบบงานต่างๆ
            </p>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {isSupabaseConfigured && (
              <button
                onClick={() => setView(v => v === 'dashboard' ? 'management' : 'dashboard')}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-800 text-white text-sm sm:text-base font-semibold rounded-lg shadow-md hover:bg-gray-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-indigo-500 focus:ring-opacity-75 transition-colors duration-200"
              >
                {view === 'dashboard' ? 'จัดการข้อมูล' : 'แดชบอร์ด'}
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-6 w-6 text-gray-700" />
              ) : (
                <SunIcon className="h-6 w-6 text-yellow-400" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        <p>RPA Monitoring Dashboard © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
