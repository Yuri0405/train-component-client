import { Component,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainComponentApiService, PaginatedResult } from '../services/train-component-api-service';
import { TrainComponentDto } from '../models/train-component-dto';
import { CreateTrainComponentDto } from '../models/create-train-component-dto';
import { UpdateTrainComponentDto } from '../models/update-train-component-dto';
import { UpdateQuantityDto } from '../models/update-quantity-dto';
import { TrainModalFormComponent } from '../train-modal-form/train-modal-form.component';
import { Observable } from 'rxjs';

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
  formErrorMessage: string | null = null; // Keep for displaying form submission errors

  currentPage = 1;
  pageSize = 10; 
  totalCount = 0;
  totalPages = 0;

  searchTerm:string = ''

  isFormModalVisible  = false; // Keep modal visibility state
  isSubmitting = false; // Keep submitting state for feedback

  componentToEdit: TrainComponentDto | null = null;

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
    this.componentToEdit = null;
    this.formErrorMessage = null; 
    this.isSubmitting = false; 
    this.isFormModalVisible = true;
  }

  openEditModal(component: TrainComponentDto): void {
    // Store a *copy* of the component data to avoid issues if the user cancels
    //console.log('openEditModal called for component:', component); // <-- ADD THIS LOG
    this.componentToEdit = { ...component };
    this.formErrorMessage = null; // Clear previous form errors
    this.isSubmitting = false;    // Reset submission state
    this.isFormModalVisible = true; // Show the modal
    //console.log('componentToEdit set:', this.componentToEdit); // <-- ADD THIS LOG TOO
  }

  closeFormModal(): void {
    this.isFormModalVisible = false;
    this.componentToEdit = null; // <<< Clear edit state on close
  }

  handleFormSave(formData: any): void {
    this.isSubmitting = true;
    this.formErrorMessage = null;
  
    let apiCall: Observable<TrainComponentDto>;
    let successMessage: string;
  
    if (this.componentToEdit && this.componentToEdit.id) {
      // --- UPDATE ---
      const idToUpdate = this.componentToEdit.id;
      // Construct the Update DTO from form data
      const updateDto: UpdateTrainComponentDto = {
          name: formData.name,
          canAssignQuantity: formData.canAssignQuantity,
          quantity: formData.quantity
      };
      console.log(`Calling UPDATE for ID: ${idToUpdate} with data:`, updateDto); // <-- ADD THIS LOG
      apiCall = this.apiService.updateComponent(idToUpdate, updateDto);
      successMessage = `Component ${idToUpdate} updated successfully.`;
  
    } else {
      // --- CREATE ---
      const createDto: CreateTrainComponentDto = {
          name: formData.name,
          uniqueNumber: formData.uniqueNumber, // Assuming form emits this
          canAssignQuantity: formData.canAssignQuantity
      };
       if (!createDto.uniqueNumber) {
           this.formErrorMessage = "Unique Number is missing from form data for creation.";
           this.isSubmitting = false;
           return;
       }
      //console.log('Creating new component:', createDto);
      apiCall = this.apiService.createComponent(createDto);
      successMessage = `Component created successfully.`;
    }
  
    // Subscribe to the relevant API call
    apiCall.subscribe({
      next: (savedComponent) => {
        console.log(successMessage, savedComponent);
        this.isSubmitting = false;
        this.closeFormModal();  // Close modal on success
        this.loadComponents(); // Refresh the list
        // TODO: Add user-friendly success notification
      },
      error: (err) => {
        console.error('Error saving component:', err);
        this.formErrorMessage = err.error?.message || err.message || 'Failed to save component.';
        this.isSubmitting = false; // Re-enable form
      }
    });
  }

  saveQuantity(id: number, newQuantityValue: string): void {
    console.log(`Attempting to save quantity for ID: ${id}, New Value: ${newQuantityValue}`);
    // 1. Validate Input
    const newQuantity = parseInt(newQuantityValue, 10); 
    if (isNaN(newQuantity) || newQuantity <= 0) { 
        console.error('Invalid quantity input:', newQuantityValue);
        this.formErrorMessage = `Invalid quantity for item ${id}. Please enter a positive number.`;
        return; // Stop processing
    }
    this.formErrorMessage = null; // Clear previous errors
    this.isLoading = true; // Indicate activity (optional, could be more granular later)
    // 2. Prepare DTO
    const quantityDto: UpdateQuantityDto = { quantity: newQuantity };
    // 3. Call API Service
    this.apiService.updateComponentQuantity(id, quantityDto).subscribe({
      next: () => {
        console.log(`Quantity updated successfully for ID: ${id}`);
        this.isLoading = false;
        const index = this.trainComponents.findIndex(c => c.id === id);
        if (index !== -1) {
          this.trainComponents[index].quantity = newQuantity;
        }
      },
      error: (err) => {
        console.error(`Error updating quantity for ID: ${id}:`, err);
        this.isLoading = false;
        this.formErrorMessage = `Failed to update quantity for item ${id}: ${err.error?.message || err.message || 'Unknown error'}`;
      }
    });
  }
}
