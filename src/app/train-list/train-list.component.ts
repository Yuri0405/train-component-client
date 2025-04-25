import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainComponentApiService, PaginatedResult } from '../services/train-component-api-service';
import { TrainComponentDto } from '../models/train-component-dto';
import { CreateTrainComponentDto } from '../models/create-train-component-dto';
import { TrainModalFormComponent } from '../train-modal-form/train-modal-form.component';

@Component({
  selector: 'app-train-list',
  standalone: true,
  imports: [CommonModule,TrainModalFormComponent],
  templateUrl: './train-list.component.html',
  styleUrl: './train-list.component.css'
})
export class TrainListComponent implements OnInit {

  trainComponents: TrainComponentDto[] = []
  isLoading = false
  errorMessage: string | null = null
  createErrorMessage: string | null = null; // Keep for displaying form submission errors

  currentPage = 1;
  pageSize = 10; 
  totalCount = 0;
  totalPages = 0;

  searchTerm:string = ''

  isAddModalVisible = false; // Keep modal visibility state
  isSubmitting = false; // Keep submitting state for feedback

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

  // --- Update Modal Methods ---
  openAddModal(): void {
    this.createErrorMessage = null; // Clear previous errors
    this.isSubmitting = false; // Reset submitting state
    this.isAddModalVisible = true;
    // Resetting the form itself now happens inside TrainFormComponent's ngOnInit/buildForm
    // If needed later for Edit: you could pass initial data via @Input to TrainFormComponent
  }


  closeAddModal(): void {
    this.isAddModalVisible = false;
  }

  // --- Method to handle the 'save' event from TrainFormComponent ---
  handleSave(formData: CreateTrainComponentDto): void {
    this.isSubmitting = true; // Indicate submission start
    this.createErrorMessage = null;
    console.log("Launched creation logic")
    this.apiService.createComponent(formData).subscribe({
      next: (newComponent) => {
        console.log('Component created successfully:', newComponent);
        this.isSubmitting = false;
        this.closeAddModal(); // Close modal on success
        // Consider navigating to the page where the new item is, or just reloading current page
        this.loadComponents(); // Refresh the list
        // TODO: Add success notification/toast message
      },
      error: (err) => {
        console.error('Error creating component:', err);
        this.createErrorMessage = err.error?.message || err.message || 'Failed to create component. Please try again.';
        this.isSubmitting = false; 
      }
    });
  }
}
