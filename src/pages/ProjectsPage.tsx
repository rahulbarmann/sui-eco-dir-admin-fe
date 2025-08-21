import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Calendar } from "lucide-react";
import type { Project } from "../types";
import apiService from "../services/api";

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(
        null
    );

    useEffect(() => {
        fetchProjects();
    }, [currentPage, searchTerm, statusFilter]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await apiService.getProjects(currentPage, 10);
            console.log("Projects response:", response);

            // Handle the response structure from the admin API
            if (response && typeof response === "object") {
                if (response.projects && Array.isArray(response.projects)) {
                    setProjects(response.projects);
                    setTotalPages(response.pagination?.totalPages || 1);
                } else if (Array.isArray(response)) {
                    setProjects(response);
                    setTotalPages(1);
                } else {
                    setProjects([]);
                    setTotalPages(1);
                }
            } else {
                setProjects([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            setProjects([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (project: Project) => {
        setProjectToDelete(project);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;

        try {
            await apiService.deleteProject(projectToDelete.id);
            setProjects(projects.filter((p) => p.id !== projectToDelete.id));
            setShowDeleteModal(false);
            setProjectToDelete(null);
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-gray-100 text-gray-800",
            pending: "bg-yellow-100 text-yellow-800",
        };
        return (
            statusConfig[status as keyof typeof statusConfig] ||
            "bg-gray-100 text-gray-800"
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Projects
                    </h1>
                    <p className="text-gray-600">
                        Manage all projects in the Sui ecosystem directory
                    </p>
                </div>
                <Link
                    to="/projects/new"
                    className="btn-primary flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Projects List */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Featured
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map((project) => (
                                    <tr
                                        key={project.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    src={project.logo}
                                                    alt={project.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "https://via.placeholder.com/40x40?text=P";
                                                    }}
                                                />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {project.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {project.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {project.categories &&
                                                project.categories.length >
                                                    0 ? (
                                                    project.categories.map(
                                                        (category, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                                                            >
                                                                {category}
                                                            </span>
                                                        )
                                                    )
                                                ) : (
                                                    <span className="text-sm text-gray-500">
                                                        No categories
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(
                                                    project.status
                                                )}`}
                                            >
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    project.featured
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {project.featured
                                                    ? "Yes"
                                                    : "No"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(
                                                    project.createdAt
                                                ).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    to={`/projects/${project.id}`}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    to={`/projects/${project.id}/edit`}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(project)
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center"
                                    >
                                        <p className="text-gray-500">
                                            No projects found
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.max(1, currentPage - 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.min(
                                                totalPages,
                                                currentPage + 1
                                            )
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && projectToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Delete Project
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "
                            {projectToDelete.name}"? This action cannot be
                            undone.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn-danger flex-1"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
