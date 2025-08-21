import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Edit,
    ExternalLink,
    Globe,
    Twitter,
    Github,
    Calendar,
    Tag,
    Eye,
    Star,
} from "lucide-react";
import type { Project } from "../types";
import apiService from "../services/api";

const ProjectDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const projectData = await apiService.getProject(id!);
            setProject(projectData);
        } catch (error) {
            console.error("Failed to fetch project:", error);
        } finally {
            setLoading(false);
        }
    };

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Project not found</p>
                <Link to="/projects" className="btn-primary mt-4">
                    Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate("/projects")}
                        className="p-2 text-gray-400 hover:text-gray-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {project.name}
                        </h1>
                        <p className="text-gray-600">Project Details</p>
                    </div>
                </div>
                <Link
                    to={`/projects/${project.id}/edit`}
                    className="btn-primary flex items-center"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Project
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Logo and Basic Info */}
                    <div className="card p-6">
                        <div className="flex items-start space-x-6">
                            {project.logo && (
                                <img
                                    src={project.logo}
                                    alt={project.name}
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {project.name}
                                    </h2>
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                                            project.status
                                        )}`}
                                    >
                                        {project.status}
                                    </span>
                                    {project.featured && (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                            <Star className="w-3 h-3 inline mr-1" />
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {project.description}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 mr-1" />
                                        <div className="flex flex-wrap gap-1">
                                            {project.categories &&
                                            project.categories.length > 0 ? (
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
                                                <span className="text-gray-500">
                                                    No categories
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Created {formatDate(project.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    {(project.website || project.twitter || project.github) && (
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Social Links
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {project.website && (
                                    <a
                                        href={project.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Globe className="w-5 h-5 text-blue-600 mr-3" />
                                        <span className="text-sm font-medium">
                                            Website
                                        </span>
                                        <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                                    </a>
                                )}
                                {project.twitter && (
                                    <a
                                        href={project.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Twitter className="w-5 h-5 text-blue-400 mr-3" />
                                        <span className="text-sm font-medium">
                                            Twitter
                                        </span>
                                        <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                                    </a>
                                )}
                                {project.github && (
                                    <a
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Github className="w-5 h-5 text-gray-900 mr-3" />
                                        <span className="text-sm font-medium">
                                            GitHub
                                        </span>
                                        <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Project Images */}
                    {project.images && project.images.length > 0 && (
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Project Images
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image}
                                            alt={`${project.name} - Image ${
                                                index + 1
                                            }`}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Stats */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Project Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                                        project.status
                                    )}`}
                                >
                                    {project.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Categories
                                </span>
                                <div className="text-right">
                                    {project.categories &&
                                    project.categories.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 justify-end">
                                            {project.categories.map(
                                                (category, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                                                    >
                                                        {category}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 text-sm">
                                            No categories
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Featured</span>
                                <span className="font-medium">
                                    {project.featured ? "Yes" : "No"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created</span>
                                <span className="font-medium">
                                    {formatDate(project.createdAt)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Updated</span>
                                <span className="font-medium">
                                    {formatDate(project.updatedAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <Link
                                to={`/projects/${project.id}/edit`}
                                className="w-full btn-primary flex items-center justify-center"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Project
                            </Link>
                            {project.website && (
                                <a
                                    href={project.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full btn-secondary flex items-center justify-center"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Live
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;
