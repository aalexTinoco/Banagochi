/**
 * Project Service
 */

import { HttpClient } from '../utils/http-client';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  AddVoteRequest,
  AddFundingRequest,
  AddFeedItemRequest,
  ProjectResponse,
  ProjectFilters,
} from '../types';

export class ProjectService {
  private static baseUrl = API_CONFIG.OPERATIONAL_BASE_URL;

  /**
   * Create new project
   */
  static async createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
    return HttpClient.post<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.CREATE}`,
      data
    );
  }

  /**
   * Get all projects with optional filters
   */
  static async getAllProjects(filters?: ProjectFilters): Promise<ProjectResponse> {
    let url = `${this.baseUrl}${API_ENDPOINTS.PROJECTS.GET_ALL}`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.colonia) params.append('colonia', filters.colonia);
      if (filters.active !== undefined) params.append('active', String(filters.active));
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }

    return HttpClient.get<ProjectResponse>(url);
  }

  /**
   * Get project by ID
   */
  static async getProjectById(projectId: string): Promise<ProjectResponse> {
    return HttpClient.get<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.GET_BY_ID(projectId)}`
    );
  }

  /**
   * Update project
   */
  static async updateProject(
    projectId: string,
    data: UpdateProjectRequest
  ): Promise<ProjectResponse> {
    return HttpClient.put<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.UPDATE(projectId)}`,
      data
    );
  }

  /**
   * Delete project (soft delete)
   */
  static async deleteProject(projectId: string): Promise<any> {
    return HttpClient.delete(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.DELETE(projectId)}`
    );
  }

  /**
   * Permanently delete project
   */
  static async permanentDeleteProject(projectId: string): Promise<any> {
    return HttpClient.delete(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.DELETE_PERMANENT(projectId)}`
    );
  }

  /**
   * Add vote to project
   */
  static async addVote(
    projectId: string,
    data: AddVoteRequest
  ): Promise<ProjectResponse> {
    return HttpClient.post<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.ADD_VOTE(projectId)}`,
      data
    );
  }

  /**
   * Add funding to project
   */
  static async addFunding(
    projectId: string,
    data: AddFundingRequest
  ): Promise<ProjectResponse> {
    return HttpClient.post<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.ADD_FUNDING(projectId)}`,
      data
    );
  }

  /**
   * Add feed item to project
   */
  static async addFeedItem(
    projectId: string,
    data: AddFeedItemRequest
  ): Promise<ProjectResponse> {
    return HttpClient.post<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.ADD_FEED(projectId)}`,
      data
    );
  }

  /**
   * Get projects by colonia
   */
  static async getProjectsByColonia(colonia: string): Promise<ProjectResponse> {
    return HttpClient.get<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.GET_BY_COLONIA(colonia)}`
    );
  }

  /**
   * Get projects by status
   */
  static async getProjectsByStatus(status: string): Promise<ProjectResponse> {
    return HttpClient.get<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.GET_BY_STATUS(status)}`
    );
  }

  /**
   * Get projects by proposer
   */
  static async getProjectsByProposer(userId: string): Promise<ProjectResponse> {
    return HttpClient.get<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.GET_BY_PROPOSER(userId)}`
    );
  }
}
