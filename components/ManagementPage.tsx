import React, { useState } from 'react';
import { DataTask } from '../types';
import { PencilIcon, PlusIcon, TrashIcon } from './Icons';
import TaskModal from './TaskModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ManagementPageProps {
  tasks: DataTask[];
  onAddTask: (task: Omit<DataTask, 'id' | 'lastUpdated'>) => void;
  onUpdateTask: (task: DataTask) => void;
  onDeleteTask: (taskId: string) => void;
}

const ManagementPage: React.FC<ManagementPageProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DataTask | null>(null);

  const openAddModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: DataTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const openDeleteModal = (task: DataTask) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<DataTask, 'id' | 'lastUpdated'> | DataTask) => {
    if ('id' in taskData) {
      onUpdateTask(taskData);
    } else {
      onAddTask(taskData);
    }
    setIsTaskModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedTask) {
      onDeleteTask(selectedTask.id);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">จัดการประเภทข้อมูล</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          เพิ่มประเภทข้อมูล
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ชื่อประเภทข้อมูล</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SQL Query (แหล่งข้อมูล)</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <pre className="bg-gray-100 dark:bg-gray-900/50 p-2 rounded font-mono text-xs truncate">{task.sqlQuery}</pre>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => openEditModal(task)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="แก้ไข">
                    <PencilIcon className="w-5 h-5"/>
                  </button>
                  <button onClick={() => openDeleteModal(task)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="ลบ">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
             {tasks.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-500 dark:text-gray-400">
                        ยังไม่มีข้อมูลประเภทใดๆ, กรุณากด "เพิ่มประเภทข้อมูล"
                    </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={selectedTask}
      />
      
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={selectedTask?.title || ''}
      />
    </div>
  );
};

export default ManagementPage;