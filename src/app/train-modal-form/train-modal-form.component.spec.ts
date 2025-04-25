import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainModalFormComponent } from './train-modal-form.component';

describe('TrainModalFormComponent', () => {
  let component: TrainModalFormComponent;
  let fixture: ComponentFixture<TrainModalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainModalFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainModalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
