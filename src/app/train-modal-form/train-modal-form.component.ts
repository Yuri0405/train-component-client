import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
// --- Import Reactive Forms ---
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateTrainComponentDto } from '../models/create-train-component-dto';

@Component({
  selector: 'app-train-modal-form',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './train-modal-form.component.html',
  styleUrl: './train-modal-form.component.css'
})
export class TrainModalFormComponent implements OnInit {

  componentForm!: FormGroup; // Form group for the inputs
  isSubmitting = false; // Flag to disable button during submission

  // --- Output events ---
  @Output() save = new EventEmitter<CreateTrainComponentDto>(); // Emits form data on save
  @Output() close = new EventEmitter<void>(); // Emits when cancel is clicked
  // -------------------

  // Inject FormBuilder
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.buildForm(); // Initialize the form structure
  }

  buildForm(): void {
    this.componentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      uniqueNumber: ['', [Validators.required, Validators.maxLength(50)]],
      canAssignQuantity: [false, Validators.required]
    });
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.componentForm.invalid) {
      this.componentForm.markAllAsTouched(); // Mark fields to show errors
      return; // Stop if form is invalid
    }

    this.isSubmitting = true; // Indicate submission start (optional)

    // Prepare data matching the Create DTO
    const createDto: CreateTrainComponentDto = {
        name: this.componentForm.value.name,
        uniqueNumber: this.componentForm.value.uniqueNumber,
        canAssignQuantity: this.componentForm.value.canAssignQuantity
    };

    // Emit the save event with the form data
    this.save.emit(createDto);

    // Note: The actual API call and success/error handling
    // will now happen in the parent (TrainListComponent)
    // We might reset the isSubmitting flag in the parent upon completion/error.
  }

  // Method to handle cancellation
  onCancel(): void {
    this.close.emit(); // Emit the close event
  }

  // Optional: Reset submission state if parent signals completion/error
  setSubmitting(isSubmitting: boolean): void {
    this.isSubmitting = isSubmitting;
}

}
