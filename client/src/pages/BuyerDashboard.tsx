import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { Project } from '../types';
import DashboardLayout from '../components/DashboardLayout';

export default function BuyerDashboard() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['buyer', 'projects'],
    queryFn: async () => {
      const response = await apiClient.get('/api/buyer/projects');
      return response.data.projects as Project[];
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const response = await apiClient.post('/api/buyer/projects', data);
      return response.data.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer', 'projects'] });
      toast.success('Project created successfully!');
      setShowCreateForm(false);
      setTitle('');
      setDescription('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create project');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate({ title, description });
  };

  const projects = projectsData || [];

  return (
    <DashboardLayout role="BUYER">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Dashboard</h1>
            <p className="text-gray-600">Manage your projects and assign solvers</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary"
          >
            {showCreateForm ? 'Cancel' : '+ New Project'}
          </button>
        </motion.div>

        {/* Create Project Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card bg-blue-50 border-2 border-blue-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Build a marketplace website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project requirements..."
                />
              </div>
              <button
                type="submit"
                disabled={createProjectMutation.isPending}
                className="btn btn-primary"
              >
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Projects List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card text-center py-12"
            >
              <p className="text-gray-500 mb-4">You haven't created any projects yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                Create Your First Project
              </button>
            </motion.div>
          ) : (
            projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/buyer/projects/${project.id}`}>
                  <div className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                        <p className="text-gray-600 mt-2">{project.description}</p>
                        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                          {project.assignedSolver && (
                            <span className="text-green-600 font-medium">
                              ✓ Assigned to {project.assignedSolver.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`badge ${project.status === 'OPEN' ? 'badge-open' : 'badge-assigned'}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
