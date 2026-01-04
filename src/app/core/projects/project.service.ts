import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project {
  id: number;
  name: string;
  description: string;
  value: number | string;
  active: boolean;

  // API sempre em yyyy-MM-dd
  startDate: string;
  endDate: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ProjectPayload {
  name: string;
  description?: string;
  value: number;
  active: boolean;
  startDate: string;        // yyyy-MM-dd
  endDate?: string | null;  // yyyy-MM-dd | null
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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

  private api(path: string): string {
    const base = (environment.apiBaseUrl || '').replace(/\/$/, '');
    return base ? `${base}${path}` : path;
  }

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

    return this.http.get<PageResponse<Project>>(this.api('/projects'), { params: httpParams });
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(this.api(`/projects/${id}`));
  }

  create(payload: ProjectPayload): Observable<Project> {
    return this.http.post<Project>(this.api('/projects'), payload);
  }

  update(id: number, payload: ProjectPayload): Observable<Project> {
    return this.http.put<Project>(this.api(`/projects/${id}`), payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.api(`/projects/${id}`));
  }
}
