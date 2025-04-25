import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainComponentApiService, PaginatedResult } from '../services/train-component-api-service';
import { TrainComponentDto } from '../models/train-component-dto';

@Component({
  selector: 'app-train-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './train-list.component.html',
  styleUrl: './train-list.component.css'
})
export class TrainListComponent implements OnInit {

  trainComponents: TrainComponentDto[] = []
  isLoading = false
  errorMessage: string | null = null

  currentPage = 1;
  pageSize = 10; 
  totalCount = 0;
  totalPages = 0;

  searchTerm:string = ''

  constructor(private apiService: TrainComponentApiService) { }

  ngOnInit(): void {
    this.loadComponents(); // Load initial data
  }

  loadComponents(){ 
    this.isLoading = true
    this.errorMessage = null

    this.apiService.getComponents(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (result: PaginatedResult<TrainComponentDto>) => {
        this.trainComponents = result.items;
        this.totalCount = result.totalCount;

        this.isLoading = false;
        console.log('Components loaded for UI:', this.trainComponents);
        // Calculate total pages
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      },
      error: (err) => {
        console.error('UI Error loading components:', err);
        // Provide user-friendly error message
        this.errorMessage = 'Failed to load components. Check API connection or try again.';
        this.isLoading = false;
      }
    });
    
  }

  doSearch(newSearchTerm:string):void
  {
    console.log('Search performed with term:', newSearchTerm);
    this.searchTerm = newSearchTerm; // Update the search term
    this.currentPage = 1; // Reset to the first page for new search results
    this.loadComponents();
  }
  // --- Pagination Methods ---
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadComponents();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadComponents();
    }
  }
}
