import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { Task, UserRole } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import TaskStatusTimeline from '../components/TaskStatusTimeline';

export default function SolverProjectDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);

  const { data: tasksData } = useQuery({
    queryKey: ['solver', 'projects', id, 'tasks'],
    queryFn: async () => {
      const response = await apiClient.get(`/api/solver/projects/${id}/tasks`);
      return response.data.tasks as Task[];
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; deadline: string }) => {
      const response = await apiClient.post(`/api/solver/projects/${id}/tasks`, data);
      return response.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solver', 'projects', id, 'tasks'] });
      toast.success('Task created successfully!');
      setShowTaskForm(false);
      setTitle('');
      setDescription('');
      setDeadline('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create task');
    },
  });

  const submitTaskMutation = useMutation({
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`/api/solver/tasks/${taskId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setUploadProgress(percentCompleted);
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solver', 'projects', id, 'tasks'] });
      toast.success('Task submitted successfully!');
      setUploadProgress(0);
      setUploadingTaskId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit task');
      setUploadProgress(0);
      setUploadingTaskId(null);
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({ title, description, deadline });
  };

  const handleFileUpload = (taskId: string, file: File) => {
    // Validate ZIP file
    if (!file.name.endsWith('.zip')) {
      toast.error('Only ZIP files are allowed');
      return;
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setUploadingTaskId(taskId);
    submitTaskMutation.mutate({ taskId, file });
  };

  const tasks = tasksData || [];

  return (
    <DashboardLayout role={UserRole.SOLVER}>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Tasks</h1>
            <p className="text-gray-600">Create and manage your sub-module tasks</p>
          </div>
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="btn btn-primary"
          >
            {showTaskForm ? 'Cancel' : '+ New Task'}
          </button>
        </motion.div>

        {/* Create Task Form */}
        {showTaskForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card bg-green-50 border-2 border-green-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., User authentication module"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  minLength={10}
                  rows={3}
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  required
                  className="input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="btn btn-success"
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Tasks List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card text-center py-12"
            >
              <p className="text-gray-500 mb-4">No tasks created yet</p>
              <button
                onClick={() => setShowTaskForm(true)}
                className="btn btn-primary"
              >
                Create Your First Task
              </button>
            </motion.div>
          ) : (
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 mt-2">{task.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <TaskStatusTimeline status={task.status} />
                </div>

                {/* Upload Section */}
                {task.status === 'IN_PROGRESS' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Submit Deliverable</h4>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".zip"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(task.id, file);
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        disabled={uploadingTaskId === task.id}
                      />
                    </div>
                    {uploadingTaskId === task.id && uploadProgress > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4"
                      >
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="bg-green-600 h-2 rounded-full"
                          />
                        </div>
                      </motion.div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Only ZIP files up to 25MB are allowed
                    </p>
                  </div>
                )}

                {task.status === 'SUBMITTED' && (
                  <div className="mt-6 pt-6 border-t border-gray-200 bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-800 font-medium">
                      ✓ Task submitted! Waiting for buyer review...
                    </p>
                  </div>
                )}

                {task.status === 'COMPLETED' && (
                  <div className="mt-6 pt-6 border-t border-gray-200 bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✓ Task completed and accepted by buyer!
                    </p>
                  </div>
                )}

                {task.status === 'REJECTED' && (
                  <div className="mt-6 pt-6 border-t border-gray-200 bg-red-50 p-4 rounded-lg">
                    <p className="text-red-800 font-medium">
                      ✗ Task rejected by buyer. Please review feedback and revise.
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
