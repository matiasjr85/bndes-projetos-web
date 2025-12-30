import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: number;
  name: string;
  description: string;
  value: number | string;
  active: boolean;
  startDate: string;  
  endDate: string;    
  createdAt: string;  
  updatedAt: string;  
}

export interface SortInfo {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface PageableInfo {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: SortInfo;
}

export interface PageResponse<T> {
  content: T[];
  pageable: PageableInfo;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: SortInfo;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ListProjectsParams {
  active?: boolean | null;
  q?: string;
  page?: number; 
  size?: number;
  sort?: string; 
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) {}

  list(params: ListProjectsParams = {}): Observable<PageResponse<Project>> {
    let httpParams = new HttpParams();

    if (params.active !== undefined && params.active !== null) {
      httpParams = httpParams.set('active', String(params.active));
    }
    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }

    httpParams = httpParams.set('page', String(params.page ?? 0));
    httpParams = httpParams.set('size', String(params.size ?? 10));

    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<PageResponse<Project>>('/projects', { params: httpParams });
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`/projects/${id}`);
  }

  create(payload: Partial<Project>): Observable<Project> {
    return this.http.post<Project>('/projects', payload);
  }

  update(id: number, payload: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`/projects/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/projects/${id}`);
  }
}