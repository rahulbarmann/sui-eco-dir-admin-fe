import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FolderOpen,
    Tag,
    Video,
    Eye,
    Plus,
    ExternalLink,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import type { DashboardStats } from "../types";
import apiService from "../services/api";

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const data = await apiService.getDashboardStats();
            console.log("Dashboard stats received:", data);
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            setError("Failed to load dashboard data. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleRefresh = () => {
        fetchStats(true);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="ml-4 space-y-2">
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="mt-4 h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="card p-6">
                            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Welcome back! Here's what's happening with your Sui
                            ecosystem directory.
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="btn-secondary flex items-center"
                        >
                            <RefreshCw
                                className={`w-4 h-4 mr-2 ${
                                    refreshing ? "animate-spin" : ""
                                }`}
                            />
                            Refresh
                        </button>
                        <Link
                            to="/projects/new"
                            className="btn-primary flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Project
                        </Link>
                    </div>
                </div>

                {/* Error State */}
                <div className="card p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Unable to Load Dashboard
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="btn-primary flex items-center mx-auto"
                    >
                        <RefreshCw
                            className={`w-4 h-4 mr-2 ${
                                refreshing ? "animate-spin" : ""
                            }`}
                        />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No dashboard data available</p>
            </div>
        );
    }

    // Add fallbacks for missing data
    const recentProjects = stats.recentProjects || [];
    const topCategories = stats.topCategories || [];

    // Sample chart data - in real app, this would come from the API
    const categoryData = (stats.categoryCounts || topCategories)
        .filter(
            (cat: any) =>
                typeof (cat.projectCount ?? cat.projectCount) === "number"
        )
        .map((cat: any) => ({
            name: cat.name,
            projects: cat.projectCount,
        }));

    const monthlyData =
        (stats as any).monthlyProjectCounts?.map((m: any) => ({
            month: m.month,
            projects: m.count,
        })) || [];

    const statusData = [
        { name: "Published", value: stats.activeProjects, color: "#10B981" },
        {
            name: "Unpublished",
            value: stats.totalProjects - stats.activeProjects,
            color: "#6B7280",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Welcome back! Here's what's happening with your Sui
                        ecosystem directory.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="btn-secondary flex items-center justify-center"
                    >
                        <RefreshCw
                            className={`w-4 h-4 mr-2 ${
                                refreshing ? "animate-spin" : ""
                            }`}
                        />
                        Refresh
                    </button>
                    <Link
                        to="/projects/new"
                        className="btn-primary flex items-center justify-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="card p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                        <div className="ml-3 lg:ml-4">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">
                                Total Projects
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                {stats.totalProjects}
                            </p>
                        </div>
                    </div>
                    {/* Removed static growth text */}
                </div>

                <div className="card p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                        </div>
                        <div className="ml-3 lg:ml-4">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">
                                Active Projects
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                {stats.activeProjects}
                            </p>
                        </div>
                    </div>
                    {/* Removed static growth text */}
                </div>

                <div className="card p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Tag className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                        </div>
                        <div className="ml-3 lg:ml-4">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">
                                Categories
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                {stats.totalCategories}
                            </p>
                        </div>
                    </div>
                    {/* Removed static timestamp text */}
                </div>

                <div className="card p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Video className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                        <div className="ml-3 lg:ml-4">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">
                                Videos
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                {stats.totalVideos}
                            </p>
                        </div>
                    </div>
                    {/* Removed static growth text */}
                </div>
            </div>

            {/* Featured counts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            Featured Projects
                        </span>
                        <span className="text-lg font-semibold">
                            {stats.featuredProjectCount ?? 0} / 3
                        </span>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            Featured Videos
                        </span>
                        <span className="text-lg font-semibold">
                            {stats.featuredVideoCount ?? 0} / 3
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Projects by Category */}
                <div className="card p-4 lg:p-6">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
                        Projects by Category
                    </h3>
                    <ResponsiveContainer
                        width="100%"
                        height={250}
                        className="lg:h-[300px]"
                    >
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="projects" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Growth */}
                <div className="card p-4 lg:p-6">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
                        Monthly Project Growth
                    </h3>
                    <ResponsiveContainer
                        width="100%"
                        height={250}
                        className="lg:h-[300px]"
                    >
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="projects"
                                stroke="#3B82F6"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Project Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="card p-4 lg:p-6">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
                        Project Status
                    </h3>
                    <ResponsiveContainer
                        width="100%"
                        height={180}
                        className="lg:h-[200px]"
                    >
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {statusData.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span className="text-xs lg:text-sm text-gray-600">
                                        {item.name}
                                    </span>
                                </div>
                                <span className="text-xs lg:text-sm font-medium text-gray-900">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Projects */}
                <div className="lg:col-span-2 card p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                            Recent Projects
                        </h3>
                        <Link
                            to="/projects"
                            className="text-xs lg:text-sm text-primary-600 hover:text-primary-700"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3 lg:space-y-4">
                        {recentProjects.length > 0 ? (
                            recentProjects.slice(0, 5).map((project) => (
                                <div
                                    key={project.id}
                                    className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center min-w-0 flex-1">
                                        <img
                                            src={project.logo}
                                            alt={project.name}
                                            className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg object-cover flex-shrink-0"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    "https://via.placeholder.com/40x40?text=P";
                                            }}
                                        />
                                        <div className="ml-3 min-w-0 flex-1">
                                            <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">
                                                {project.name}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {project.categories &&
                                                project.categories.length >
                                                    0 ? (
                                                    project.categories
                                                        .slice(0, 2)
                                                        .map(
                                                            (
                                                                category,
                                                                index
                                                            ) => (
                                                                <span
                                                                    key={index}
                                                                    className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                                                                >
                                                                    {category}
                                                                </span>
                                                            )
                                                        )
                                                ) : (
                                                    <span className="text-xs text-gray-500">
                                                        No categories
                                                    </span>
                                                )}
                                                {project.categories &&
                                                    project.categories.length >
                                                        2 && (
                                                        <span className="text-xs text-gray-500">
                                                            +
                                                            {project.categories
                                                                .length -
                                                                2}{" "}
                                                            more
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-3">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                                                project.status === "PUBLISHED"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {project.status}
                                        </span>
                                        <Link to={`/projects/${project.id}`}>
                                            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    No recent projects found
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
