import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { Project, WorkRequest, Task, Submission } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import LifecycleStepper from '../components/LifecycleStepper';

export default function BuyerProjectDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: projectData } = useQuery({
    queryKey: ['buyer', 'projects', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/buyer/projects/${id}`);
      return response.data.project as Project;
    },
  });

  const { data: requestsData } = useQuery({
    queryKey: ['buyer', 'projects', id, 'requests'],
    queryFn: async () => {
      const response = await apiClient.get(`/api/buyer/projects/${id}/requests`);
      return response.data.requests as WorkRequest[];
    },
    enabled: !!projectData && projectData.status === 'OPEN',
  });

  const assignSolverMutation = useMutation({
    mutationFn: async (workRequestId: string) => {
      await apiClient.post(`/api/buyer/projects/${id}/assign-solver`, { workRequestId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer', 'projects', id] });
      queryClient.invalidateQueries({ queryKey: ['buyer', 'projects', id, 'requests'] });
      toast.success('Solver assigned successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to assign solver');
    },
  });

  const reviewSubmissionMutation = useMutation({
    mutationFn: async ({ taskId, decision, feedback }: { taskId: string; decision: 'ACCEPT' | 'REJECT'; feedback?: string }) => {
      await apiClient.post(`/api/buyer/tasks/${taskId}/review`, { decision, feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer', 'projects', id, 'tasks'] });
      toast.success('Review submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to review submission');
    },
  });

  const project = projectData;
  const requests = requestsData || [];

  if (!project) {
    return (
      <DashboardLayout role="BUYER">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="BUYER">
      <div className="space-y-8">
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
          <p className="text-gray-600">{project.description}</p>
        </motion.div>

        {/* Lifecycle Stepper */}
        <LifecycleStepper status={project.status} />

        {/* Open Project: Show Requests */}
        {project.status === 'OPEN' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Work Requests ({requests.length})
            </h2>
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No work requests yet. Solvers can request to work on this project.
              </p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{request.solver.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{request.solver.email}</p>
                        {request.message && (
                          <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Requested: {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge badge-${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                        {request.status === 'PENDING' && (
                          <button
                            onClick={() => assignSolverMutation.mutate(request.id)}
                            disabled={assignSolverMutation.isPending}
                            className="btn btn-success btn-sm"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Assigned Project: Show Info */}
        {project.status === 'ASSIGNED' && project.assignedSolver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card bg-green-50 border-2 border-green-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assigned Solver</h2>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                {project.assignedSolver.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{project.assignedSolver.name}</h3>
                <p className="text-sm text-gray-600">{project.assignedSolver.email}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-700">
              The solver will create tasks and submit deliverables for your review.
            </p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
