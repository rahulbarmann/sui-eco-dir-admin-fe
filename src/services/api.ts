import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type {
    User,
    Project,
    Category,
    Video,
    LoginCredentials,
    AuthResponse,
    DashboardStats,
    ApiResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: `${API_BASE_URL}/api/v1`,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Add request interceptor to include auth token
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem("admin_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Add response interceptor to handle errors
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    const url: string = error?.response?.config?.url || "";
                    // Don't redirect on login/auth endpoints so UI can show validation errors
                    const isAuthEndpoint = url.includes("/auth/login");
                    if (!isAuthEndpoint) {
                        localStorage.removeItem("admin_token");
                        localStorage.removeItem("admin_user");
                        window.location.href = "/login";
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response: AxiosResponse<ApiResponse<AuthResponse>> =
            await this.api.post("/auth/login", credentials);
        return response.data.data;
    }

    async logout(): Promise<void> {
        await this.api.post("/auth/logout");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
    }

    async getCurrentUser(): Promise<User> {
        const response: AxiosResponse<ApiResponse<User>> = await this.api.get(
            "/auth/me"
        );
        return response.data.data;
    }

    // Dashboard endpoints
    async getDashboardStats(): Promise<DashboardStats> {
        const response: AxiosResponse<ApiResponse<DashboardStats>> =
            await this.api.get("/admin/dashboard");
        return response.data.data;
    }

    async getFeaturedCounts(): Promise<{ projects: number; videos: number }> {
        const data = await this.getDashboardStats();
        return {
            projects: data.featuredProjectCount ?? 0,
            videos: data.featuredVideoCount ?? 0,
        };
    }

    // Project endpoints
    async getProjects(page = 1, limit = 10): Promise<any> {
        const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
            `/admin/projects?page=${page}&limit=${limit}`
        );
        return response.data.data;
    }

    // Get only published projects for video association
    async getPublishedProjects(): Promise<Project[]> {
        const response: AxiosResponse<ApiResponse<Project[]>> =
            await this.api.get(`/projects?status=published&limit=100`);
        return response.data.data;
    }

    async getProject(id: string): Promise<Project> {
        const response: AxiosResponse<ApiResponse<Project>> =
            await this.api.get(`/admin/projects/${id}`);
        return response.data.data;
    }

    async createProject(project: Partial<Project>): Promise<Project> {
        try {
            const response: AxiosResponse<ApiResponse<Project>> =
                await this.api.post("/admin/projects", project);
            return response.data.data;
        } catch (err: any) {
            const msg = err?.response?.data?.error as string | undefined;
            if (msg && msg.toLowerCase().includes("featured")) {
                alert(
                    "Only 3 featured projects are allowed. Please unfeature an existing project first."
                );
            }
            throw err;
        }
    }

    async updateProject(
        id: string,
        project: Partial<Project>
    ): Promise<Project> {
        try {
            const response: AxiosResponse<ApiResponse<Project>> =
                await this.api.put(`/admin/projects/${id}`, project);
            return response.data.data;
        } catch (err: any) {
            const msg = err?.response?.data?.error as string | undefined;
            if (msg && msg.toLowerCase().includes("featured")) {
                alert(
                    "Only 3 featured projects are allowed. Please unfeature an existing project first."
                );
            }
            throw err;
        }
    }

    async deleteProject(id: string): Promise<void> {
        await this.api.delete(`/admin/projects/${id}`);
    }

    // Category endpoints
    async getCategories(): Promise<Category[]> {
        const response: AxiosResponse<ApiResponse<Category[]>> =
            await this.api.get("/admin/categories");
        return response.data.data;
    }

    async createCategory(category: Partial<Category>): Promise<Category> {
        const response: AxiosResponse<ApiResponse<Category>> =
            await this.api.post("/admin/categories", category);
        return response.data.data;
    }

    async updateCategory(
        id: string,
        category: Partial<Category>
    ): Promise<Category> {
        const response: AxiosResponse<ApiResponse<Category>> =
            await this.api.put(`/admin/categories/${id}`, category);
        return response.data.data;
    }

    async deleteCategory(id: string): Promise<void> {
        await this.api.delete(`/admin/categories/${id}`);
    }

    // Video endpoints
    async getVideos(
        page = 1,
        limit = 10,
        search?: string,
        featured?: boolean,
        projectId?: string
    ): Promise<any> {
        let url = `/videos?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (featured !== undefined) url += `&featured=${featured}`;
        if (projectId) url += `&projectId=${projectId}`;

        const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
            url
        );
        return response.data;
    }

    async getVideo(id: string): Promise<Video> {
        const response: AxiosResponse<ApiResponse<Video>> = await this.api.get(
            `/videos/${id}`
        );
        return response.data.data;
    }

    async createVideo(video: Partial<Video>): Promise<Video> {
        try {
            const response: AxiosResponse<ApiResponse<Video>> =
                await this.api.post(
                    `/videos/project/${video.projectId}`,
                    video
                );
            return response.data.data;
        } catch (err: any) {
            const msg = err?.response?.data?.error as string | undefined;
            if (msg && msg.toLowerCase().includes("featured")) {
                alert(
                    "Only 3 featured videos are allowed. Please unfeature an existing video first."
                );
            }
            throw err;
        }
    }

    async updateVideo(id: string, video: Partial<Video>): Promise<Video> {
        try {
            const response: AxiosResponse<ApiResponse<Video>> =
                await this.api.put(`/videos/${id}`, video);
            return response.data.data;
        } catch (err: any) {
            const msg = err?.response?.data?.error as string | undefined;
            if (msg && msg.toLowerCase().includes("featured")) {
                alert(
                    "Only 3 featured videos are allowed. Please unfeature an existing video first."
                );
            }
            throw err;
        }
    }

    async deleteVideo(id: string): Promise<void> {
        await this.api.delete(`/videos/${id}`);
    }

    // File upload
    async uploadFile(
        file: File,
        type:
            | "logo"
            | "project-hero-image"
            | "video-thumbnail"
            | "project-image"
            | "project-video",
        projectName?: string
    ): Promise<{ url: string; key: string; bucket: string }> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        if (projectName) {
            formData.append("projectName", projectName);
        }

        const response: AxiosResponse<
            ApiResponse<{ url: string; key: string; bucket: string }>
        > = await this.api.post("/upload/single", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    }

    async uploadMultipleFiles(
        files: File[],
        type: "project-image",
        projectName?: string
    ): Promise<Array<{ url: string; key: string; bucket: string }>> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });
        formData.append("type", type);
        if (projectName) {
            formData.append("projectName", projectName);
        }

        const response: AxiosResponse<
            ApiResponse<Array<{ url: string; key: string; bucket: string }>>
        > = await this.api.post("/upload/multiple", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    }

    async deleteUploadedFile(key: string): Promise<void> {
        await this.api.delete(`/upload/${key}`);
    }

    // Project folder management
    async createProjectFolders(projectName: string): Promise<void> {
        await this.api.post("/upload/project/create-folders", {
            projectName,
        });
    }

    async listProjectFiles(
        projectName: string,
        folder?: string
    ): Promise<
        Array<{ key: string; size: number; lastModified: string; url: string }>
    > {
        let url = `/upload/project/${encodeURIComponent(projectName)}/files`;
        if (folder) {
            url += `?folder=${encodeURIComponent(folder)}`;
        }

        const response: AxiosResponse<
            ApiResponse<{
                files: Array<{
                    key: string;
                    size: number;
                    lastModified: string;
                    url: string;
                }>;
            }>
        > = await this.api.get(url);
        return response.data.data.files;
    }

    // Video folder management
    async createVideoFolder(
        projectName: string,
        playbackId: string
    ): Promise<void> {
        await this.api.post("/upload/video/create-folder", {
            projectName,
            playbackId,
        });
    }

    // Upload video thumbnail
    async uploadVideoThumbnail(
        file: File,
        projectName: string,
        playbackId: string
    ): Promise<{ url: string; key: string; bucket: string }> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "video-thumbnail");
        formData.append("projectName", projectName);
        formData.append("playbackId", playbackId);

        const response: AxiosResponse<
            ApiResponse<{ url: string; key: string; bucket: string }>
        > = await this.api.post("/upload/single", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    }
}

export const apiService = new ApiService();
export default apiService;
