import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { SolverProfile, Project } from '../types';
import DashboardLayout from '../components/DashboardLayout';

export default function SolverDashboard() {
  const queryClient = useQueryClient();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');

  const { data: profileData } = useQuery({
    queryKey: ['solver', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get('/api/solver/profile');
      return response.data.profile as SolverProfile | null;
    },
  });

  const { data: availableProjectsData } = useQuery({
    queryKey: ['solver', 'available-projects'],
    queryFn: async () => {
      const response = await apiClient.get('/api/solver/projects');
      return response.data.projects as Project[];
    },
  });

  const { data: assignedProjectsData } = useQuery({
    queryKey: ['solver', 'assigned-projects'],
    queryFn: async () => {
      const response = await apiClient.get('/api/solver/assigned-projects');
      return response.data.projects as Project[];
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/api/solver/profile', data);
      return response.data.profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solver', 'profile'] });
      toast.success('Profile created successfully!');
      setShowProfileForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create profile');
    },
  });

  const requestProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiClient.post(`/api/solver/projects/${projectId}/request`, {
        message: 'I would like to work on this project.',
      });
    },
    onSuccess: () => {
      toast.success('Request sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send request');
    },
  });

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    createProfileMutation.mutate({
      displayName,
      bio,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      portfolioLinks: portfolioLinks.split('\n').map((s) => s.trim()).filter(Boolean),
    });
  };

  const profile = profileData;
  const availableProjects = availableProjectsData || [];
  const assignedProjects = assignedProjectsData || [];

  return (
    <DashboardLayout role="SOLVER">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Solver Dashboard</h1>
          <p className="text-gray-600">Browse projects and manage your assignments</p>
        </motion.div>

        {/* Profile Section */}
        {!profile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card bg-yellow-50 border-2 border-yellow-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Your Profile</h2>
            <p className="text-gray-600 mb-4">
              Create a profile to showcase your skills and start requesting projects.
            </p>
            {!showProfileForm ? (
              <button
                onClick={() => setShowProfileForm(true)}
                className="btn btn-success"
              >
                Create Profile
              </button>
            ) : (
              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your professional name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    className="input"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell buyers about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, Node.js, MongoDB, TypeScript"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Links (one per line)
                  </label>
                  <textarea
                    rows={3}
                    className="input"
                    value={portfolioLinks}
                    onChange={(e) => setPortfolioLinks(e.target.value)}
                    placeholder="https://github.com/yourusername&#10;https://yourportfolio.com"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn btn-success">
                    Create Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card bg-green-50 border-2 border-green-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profile</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Display Name:</span>
                <p className="text-gray-900">{profile.displayName}</p>
              </div>
              {profile.bio && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Bio:</span>
                  <p className="text-gray-900">{profile.bio}</p>
                </div>
              )}
              {profile.skills.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-2">Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="badge bg-green-100 text-green-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Assigned Projects */}
        {assignedProjects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Assigned Projects</h2>
            {assignedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/solver/projects/${project.id}`}>
                  <div className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-300 bg-green-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                        <p className="text-gray-600 mt-2">{project.description}</p>
                        <p className="text-sm text-gray-500 mt-3">
                          Buyer: {project.buyer?.name}
                        </p>
                      </div>
                      <span className="badge badge-assigned">ASSIGNED</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Available Projects */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Available Projects</h2>
          {availableProjects.length === 0 ? (
            <p className="text-gray-500 card text-center py-8">
              No available projects at the moment
            </p>
          ) : (
            availableProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-gray-600 mt-2">{project.description}</p>
                    <p className="text-sm text-gray-500 mt-3">Buyer: {project.buyer?.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="badge badge-open">OPEN</span>
                    {profile && (
                      <button
                        onClick={() => requestProjectMutation.mutate(project.id)}
                        disabled={requestProjectMutation.isPending}
                        className="btn btn-primary btn-sm"
                      >
                        Request to Work
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
