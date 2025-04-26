import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
// --- Import Reactive Forms ---
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateTrainComponentDto } from '../models/create-train-component-dto';
import { TrainComponentDto } from '../models/train-component-dto';

@Component({
  selector: 'app-train-modal-form',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './train-modal-form.component.html',
  styleUrl: './train-modal-form.component.css'
})
export class TrainModalFormComponent implements OnInit, OnChanges{

  componentForm!: FormGroup; // Form group for the inputs
  isSubmitting = false; // Flag to disable button during submission
  isEditMode = false;

  // --- Add @Input() decorator here ---
  @Input() initialData: TrainComponentDto | null = null;
  // -----------------------------------

  // --- Output events ---
  @Output() save = new EventEmitter<CreateTrainComponentDto>(); // Emits form data on save
  @Output() close = new EventEmitter<void>(); // Emits when cancel is clicked
  // -------------------

  // Inject FormBuilder
  constructor(private fb: FormBuilder) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if the 'initialData' input property specifically changed
    if (changes['initialData'] && this.initialData) {
        // Ensure the form exists before trying to patch it
        if (!this.componentForm) {
            this.buildForm(); // Build form if it doesn't exist yet (might happen on first change)
        }
        console.log('TrainFormComponent ngOnChanges received initialData:', this.initialData); // <-- ADD/CHECK THIS LOG
        // Use patchValue to populate the form with the received data
        this.componentForm.patchValue({
            name: this.initialData.name,
            uniqueNumber: this.initialData.uniqueNumber,
            canAssignQuantity: this.initialData.canAssignQuantity,
            quantity: this.initialData.quantity // Include quantity if it's part of the form
        });
        this.isEditMode = true; // Set edit mode flag
    } else if (changes['initialData'] && !this.initialData && this.componentForm) {
        // Handle case where initialData changes back to null (e.g., switching from edit to add)
        console.log('ngOnChanges detected initialData became null, resetting form.'); // Log for debugging
        this.isEditMode = false;
        this.componentForm.reset({
            name: '',
            uniqueNumber: '',
            canAssignQuantity: false,
            quantity: null
        });
    }
}

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
  }

  // Method to handle cancellation
  onCancel(): void {
    this.close.emit(); // Emit the close event
  }

  setSubmitting(isSubmitting: boolean): void {
    this.isSubmitting = isSubmitting;
}

}
