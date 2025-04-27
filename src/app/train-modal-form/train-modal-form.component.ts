// train-modal-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrainComponentDto } from '../models/train-component-dto';  // :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}

@Component({
  selector: 'app-train-modal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './train-modal-form.component.html',
  styleUrls: ['./train-modal-form.component.css']
})
export class TrainModalFormComponent implements OnInit {
  @Input() initialData: TrainComponentDto | null = null;
  @Input() isSubmitting = false;              // optional: parent can bind loading state
  @Output() save    = new EventEmitter<any>();
  @Output() close   = new EventEmitter<void>();

  componentForm!: FormGroup;
  isEditMode = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEditMode = !!this.initialData;
    // build the form, seeding default/create vs. edit values
    this.componentForm = this.fb.group({
      name:            [this.initialData?.name ?? '', Validators.required],
      uniqueNumber:    [{ value: this.initialData?.uniqueNumber ?? '', disabled: this.isEditMode }, Validators.required],
      canAssignQuantity: [this.initialData?.canAssignQuantity ?? false],
      quantity:        [this.initialData?.quantity ?? null]
    });

    // whenever canAssignQuantity toggles, enable/disable quantity field
    this.componentForm.get('canAssignQuantity')!
      .valueChanges
      .subscribe(_ => this.toggleQuantityControl());

    // initial toggle
    this.toggleQuantityControl();
  }

  private toggleQuantityControl() {
    const qty = this.componentForm.get('quantity')!;
    if (this.componentForm.get('canAssignQuantity')!.value) {
      qty.enable();
      qty.setValidators([Validators.required, Validators.min(1)]);
    } else {
      qty.disable();
      qty.clearValidators();
      qty.setValue(null);
    }
    qty.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.componentForm.invalid) {
      this.componentForm.markAllAsTouched();
      return;
    }
    // getRawValue() includes disabled fields (e.g. uniqueNumber in edit mode)
    this.save.emit(this.componentForm.getRawValue());
  }

  onClose(): void {
    this.close.emit();
  }
}
