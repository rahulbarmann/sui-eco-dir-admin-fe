import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Star, Calendar, Tag } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";
import type { Video } from "../types";
import apiService from "../services/api";

const VideoDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchVideo();
        }
    }, [id]);

    const fetchVideo = async () => {
        try {
            setLoading(true);
            const videoData = await apiService.getVideo(id!);
            setVideo(videoData);
        } catch (error) {
            console.error("Failed to fetch video:", error);
            setError("Failed to load video details");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!video) return;

        try {
            setDeleting(true);
            await apiService.deleteVideo(video.id);
            navigate("/videos");
        } catch (error) {
            console.error("Failed to delete video:", error);
            setError("Failed to delete video");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                    {error || "Video not found"}
                </div>
                <button
                    onClick={() => navigate("/videos")}
                    className="btn-secondary"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Videos
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate("/videos")}
                        className="btn-secondary"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {video.title}
                        </h1>
                        <p className="text-gray-600">Video Details</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => navigate(`/videos/${video.id}/edit`)}
                        className="btn-secondary"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="btn-danger"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Video Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Preview */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Video Preview
                        </h2>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                <strong>Playback ID:</strong> {video.playbackId}
                            </p>
                            <p className="text-xs text-gray-500">
                                This video uses Mux Player for streaming
                            </p>
                        </div>
                        <div className="mt-4">
                            <MuxPlayer
                                style={{ width: "100%" }}
                                playbackId={video.playbackId}
                                poster={video.thumbnail || undefined}
                                autoPlay="muted"
                                muted
                                loop
                                preload="auto"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Description
                        </h2>
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {video.description || "No description available"}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-4">
                            <div className="flex items-center">
                                <Tag className="w-4 h-4 mr-1" />
                                <div className="flex flex-wrap gap-1">
                                    {video.categories &&
                                    video.categories.length > 0 ? (
                                        video.categories.map(
                                            (category, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
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
                        </div>
                    </div>
                </div>

                {/* Right Column - Metadata */}
                <div className="space-y-6">
                    {/* Status & Stats */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Status & Stats
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Featured
                                </span>
                                <div className="flex items-center">
                                    <Star
                                        className={`w-4 h-4 mr-1 ${
                                            video.featured
                                                ? "text-yellow-500 fill-current"
                                                : "text-gray-400"
                                        }`}
                                    />
                                    <span
                                        className={`text-sm ${
                                            video.featured
                                                ? "text-yellow-600 font-medium"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {video.featured ? "Yes" : "No"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Project
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {video.projectName || "Unknown"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Timestamps
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Created
                                </div>
                                <p className="text-sm font-medium text-gray-900 ml-6">
                                    {formatDate(video.createdAt)}
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Last Updated
                                </div>
                                <p className="text-sm font-medium text-gray-900 ml-6">
                                    {formatDate(video.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Technical Details */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Technical Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-600">
                                    Video ID:
                                </span>
                                <p className="text-sm font-mono text-gray-900 break-all">
                                    {video.id}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">
                                    Playback ID:
                                </span>
                                <p className="text-sm font-mono text-gray-900 break-all">
                                    {video.playbackId}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">
                                    Project ID:
                                </span>
                                <p className="text-sm font-mono text-gray-900 break-all">
                                    {video.projectId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Delete Video
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{video.title}"?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn-secondary"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn-danger"
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Trash2 className="w-4 h-4 mr-2" />
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoDetailPage;
