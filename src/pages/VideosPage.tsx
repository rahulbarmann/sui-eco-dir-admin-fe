import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Calendar,
    Play,
    Clock,
} from "lucide-react";
import type { Video } from "../types";
import apiService from "../services/api";

const VideosPage: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [featuredFilter, setFeaturedFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVideos, setTotalVideos] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

    useEffect(() => {
        fetchVideos();
    }, [currentPage, searchTerm, featuredFilter]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const featured =
                featuredFilter === "featured"
                    ? true
                    : featuredFilter === "not-featured"
                    ? false
                    : undefined;
            const response = await apiService.getVideos(
                currentPage,
                10,
                searchTerm,
                featured
            );

            if (response && response.data) {
                setVideos(response.data);
                setTotalPages(response.pagination?.totalPages || 1);
                setTotalVideos(response.pagination?.total || 0);
            } else {
                setVideos([]);
                setTotalPages(1);
                setTotalVideos(0);
            }
        } catch (error) {
            console.error("Failed to fetch videos:", error);
            setVideos([]);
            setTotalPages(1);
            setTotalVideos(0);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (video: Video) => {
        setVideoToDelete(video);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!videoToDelete) return;

        try {
            await apiService.deleteVideo(videoToDelete.id);
            setVideos(videos.filter((v) => v.id !== videoToDelete.id));
            setShowDeleteModal(false);
            setVideoToDelete(null);
        } catch (error) {
            console.error("Failed to delete video:", error);
        }
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
                    <p className="text-gray-600">
                        Manage videos for your Sui ecosystem projects
                    </p>
                </div>
                <Link
                    to="/videos/new"
                    className="btn-primary flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video
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
                                placeholder="Search videos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={featuredFilter}
                            onChange={(e) => setFeaturedFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Videos</option>
                            <option value="featured">Featured Only</option>
                            <option value="not-featured">Not Featured</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Videos List */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Video
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Categories
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Featured
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Playback ID
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
                            {videos.length > 0 ? (
                                videos.map((video) => (
                                    <tr
                                        key={video.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {video.thumbnail ? (
                                                        <img
                                                            src={
                                                                video.thumbnail
                                                            }
                                                            alt={video.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    "https://via.placeholder.com/64x48?text=V";
                                                            }}
                                                        />
                                                    ) : (
                                                        <Play className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {video.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {video.description ||
                                                            "No description"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {video.projectName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {video.projectId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {video.categories &&
                                                video.categories.length > 0 ? (
                                                    video.categories.map(
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
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Clock className="w-4 h-4 mr-1" />
                                                Mux Video
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    video.featured
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {video.featured ? "Yes" : "No"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {video.playbackId.substring(0, 8)}
                                            ...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {formatDate(video.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <span
                                                    className="text-gray-400"
                                                    title="Mux Player integration"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </span>
                                                <Link
                                                    to={`/videos/${video.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    to={`/videos/${video.id}/edit`}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Edit video"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(video)
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete video"
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
                                        colSpan={8}
                                        className="px-6 py-12 text-center"
                                    >
                                        <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">
                                            No videos found
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
                                Showing {videos.length} of {totalVideos} videos
                                (Page {currentPage} of {totalPages})
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
            {showDeleteModal && videoToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Delete Video
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "
                            {videoToDelete.title}"? This action cannot be
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

export default VideosPage;
