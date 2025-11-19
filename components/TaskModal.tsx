import React, { useState, useEffect } from 'react';
import { DataTask } from '../types';
import { XMarkIcon } from './Icons';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<DataTask, 'id' | 'lastUpdated' | 'created_at'> | Omit<DataTask, 'lastUpdated' | 'created_at'>) => void;
  taskToEdit?: DataTask | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setSqlQuery(taskToEdit.sqlQuery);
    } else {
      setTitle('');
      setSqlQuery('');
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '' || sqlQuery.trim() === '') {
        alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
    }
    
    const taskData = { title, sqlQuery };
    if (taskToEdit) {
      onSave({ ...taskToEdit, ...taskData });
    } else {
      onSave(taskData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center" id="my-modal">
      <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">{taskToEdit ? 'แก้ไขประเภทข้อมูล' : 'เพิ่มประเภทข้อมูลใหม่'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อประเภทข้อมูล</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="sqlQuery" className="block text-sm font-medium text-gray-700 dark:text-gray-300">SQL Query</label>
            <textarea
              id="sqlQuery"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={5}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              placeholder="e.g., SELECT MAX(update_date) FROM my_table;"
              required
            />
          </div>
          <div className="flex items-center justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              ยกเลิก
            </button>
            <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;