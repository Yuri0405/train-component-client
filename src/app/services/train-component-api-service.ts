import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http'; // Import HttpClient and related types
import { Observable, map } from 'rxjs'; // Import Observable for async operations

// Import your DTO interfaces
import { TrainComponentDto } from '../models/train-component-dto';
import { CreateTrainComponentDto } from '../models/create-train-component-dto';
import { UpdateTrainComponentDto } from '../models/update-train-component-dto';
import { UpdateQuantityDto } from '../models/update-quantity-dto';

// Define an interface for the paginated response (optional but helpful)
export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    // Add other pagination details if needed (totalPages, currentPage etc.)
  }

  @Injectable({
    providedIn: 'root' // Makes the service available application-wide
  })

  export class TrainComponentApiService {
    private apiUrl = "http://localhost:5144/api/traincomponents"

    // Inject the HttpClient service
  constructor(private http: HttpClient) { }
  

  getComponents(pageNumber: number = 1,pageSize: number = 10,searchTerm?: string | null): Observable<PaginatedResult<TrainComponentDto>> 
    {  // Return type includes pagination

        let params = new HttpParams()
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString());

        if (searchTerm) {
        params = params.set('searchTerm', searchTerm);
        }

        // Make the GET request
        // 'observe: "response"' gets the full HttpResponse to access headers
        return this.http.get<TrainComponentDto[]>(this.apiUrl, { params: params, observe: 'response' })
        .pipe(
            map((response: HttpResponse<TrainComponentDto[]>) => {
            // Extract pagination header (adjust header name 'X-Pagination' if different)
            const paginationHeader = response.headers.get('X-Pagination');
            let totalCount = 0;
            if (paginationHeader) {
                const paginationData = JSON.parse(paginationHeader);
                totalCount = paginationData.totalCount; // Or totalItems, check your backend header
            }

            // Return the data and pagination info
            return {
                items: response.body || [], // The array of components is in the body
                totalCount: totalCount
            };
            })
        );
    }

    getComponentById(id: number): Observable<TrainComponentDto> 
    {
        const url = `${this.apiUrl}/${id}`; // Append ID to base URL
        return this.http.get<TrainComponentDto>(url);
    }

  }

  