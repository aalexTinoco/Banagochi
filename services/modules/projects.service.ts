/**
 * Projects Service
 */

import { HttpClient } from '../utils/http-client';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  VoteRequest,
  FundingRequest,
  AddFeedRequest,
  ProjectsResponse,
  ProjectResponse,
} from '../types/projects.types';

export class ProjectsService {
  private static baseUrl = API_CONFIG.OPERATIONAL_BASE_URL;

  /**
   * Get all projects
   */
  static async getAll(): Promise<Project[]> {
    const response = await HttpClient.get<ProjectsResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.GET_ALL}`
    );
    // Handle both response formats: { data: [...] } or { projects: [...] }
    return response.data || response.projects || [];
  }

  /**
   * Get project by ID
   */
  static async getById(id: string): Promise<Project> {
    const response = await HttpClient.get<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.GET_BY_ID(id)}`
    );
    // Handle both response formats: { data: {...} } or { project: {...} }
    if (!response.data && !response.project) {
      throw new Error('Project not found');
    }
    return (response.data || response.project)!;
  }

  /**
   * Get projects by colonia
   */
  static async getByColonia(colonia: string): Promise<Project[]> {
    const response = await HttpClient.get<ProjectsResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.GET_BY_COLONIA(colonia)}`
    );
    return response.data || response.projects || [];
  }

  /**
   * Get projects by status
   */
  static async getByStatus(status: string): Promise<Project[]> {
    const response = await HttpClient.get<ProjectsResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.GET_BY_STATUS(status)}`
    );
    return response.data || response.projects || [];
  }

  /**
   * Get projects by proposer (user)
   */
  static async getByProposer(userId: string): Promise<Project[]> {
    const response = await HttpClient.get<ProjectsResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.GET_BY_PROPOSER(userId)}`
    );
    return response.data || response.projects || [];
  }

  /**
   * Create new project
   */
  static async create(data: CreateProjectRequest): Promise<Project> {
    const response = await HttpClient.post<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.CREATE}`,
      data
    );
    if (!response.data && !response.project) {
      throw new Error('Failed to create project');
    }
    return (response.data || response.project)!;
  }

  /**
   * Update project
   */
  static async update(id: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await HttpClient.put<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.UPDATE(id)}`,
      data
    );
    if (!response.data && !response.project) {
      throw new Error('Failed to update project');
    }
    return (response.data || response.project)!;
  }

  /**
   * Delete project (soft delete)
   */
  static async delete(id: string): Promise<void> {
    await HttpClient.delete(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.DELETE(id)}`
    );
  }

  /**
   * Delete project permanently
   */
  static async deletePermanent(id: string): Promise<void> {
    await HttpClient.delete(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.DELETE_PERMANENT(id)}`
    );
  }

  /**
   * Add vote to project
   */
  static async addVote(id: string, data: VoteRequest): Promise<Project> {
    const response = await HttpClient.post<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.ADD_VOTE(id)}`,
      data
    );
    if (!response.data && !response.project) {
      throw new Error('Failed to add vote');
    }
    return (response.data || response.project)!;
  }

  /**
   * Add funding to project
   */
  static async addFunding(id: string, data: FundingRequest): Promise<Project> {
    const response = await HttpClient.post<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.ADD_FUNDING(id)}`,
      data
    );
    if (!response.data && !response.project) {
      throw new Error('Failed to add funding');
    }
    return (response.data || response.project)!;
  }

  /**
   * Add feed item to project
   */
  static async addFeed(id: string, data: AddFeedRequest): Promise<Project> {
    const response = await HttpClient.post<ProjectResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PROJECTS.ADD_FEED(id)}`,
      data
    );
    if (!response.data && !response.project) {
      throw new Error('Failed to add feed item');
    }
    return (response.data || response.project)!;
  }
}
