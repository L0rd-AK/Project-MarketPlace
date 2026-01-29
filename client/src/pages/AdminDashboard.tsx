import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { User, Project, UserRole } from '../types';
import DashboardLayout from '../components/DashboardLayout';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await apiClient.get('/api/admin/users');
      return response.data.users as User[];
    },
  });

  const { data: projectsData } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: async () => {
      const response = await apiClient.get('/api/admin/projects');
      return response.data.projects as Project[];
    },
  });

  const assignBuyerMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.patch(`/api/admin/users/${userId}/role`, { role: 'BUYER' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User role updated to BUYER');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update role');
    },
  });

  const users = usersData || [];
  const projects = projectsData || [];

  return (
    <DashboardLayout role={UserRole.ADMIN}>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and monitor projects</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
            <p className="text-4xl font-bold text-yellow-600">{users.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Projects</h3>
            <p className="text-4xl font-bold text-blue-600">{projects.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Projects</h3>
            <p className="text-4xl font-bold text-green-600">
              {projects.filter((p) => p.status === 'ASSIGNED').length}
            </p>
          </motion.div>
        </div>

        {/* Users Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`badge ${
                          user.role === 'ADMIN'
                            ? 'bg-yellow-100 text-yellow-800'
                            : user.role === 'BUYER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.role === 'SOLVER' && (
                        <button
                          onClick={() => assignBuyerMutation.mutate(user.id)}
                          className="btn btn-primary btn-sm"
                          disabled={assignBuyerMutation.isPending}
                        >
                          Make Buyer
                        </button>
                      )}
                      {user.role === 'ADMIN' && (
                        <span className="text-gray-400 text-xs">Cannot modify</span>
                      )}
                      {user.role === 'BUYER' && (
                        <span className="text-blue-600 text-xs">Already a Buyer</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Projects Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Projects</h2>
          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No projects yet</p>
            ) : (
              projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>Buyer: {project.buyer?.name}</span>
                        {project.assignedSolver && (
                          <span>Solver: {project.assignedSolver.name}</span>
                        )}
                      </div>
                    </div>
                    <span className={`badge ${project.status === 'OPEN' ? 'badge-open' : 'badge-assigned'}`}>
                      {project.status}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
