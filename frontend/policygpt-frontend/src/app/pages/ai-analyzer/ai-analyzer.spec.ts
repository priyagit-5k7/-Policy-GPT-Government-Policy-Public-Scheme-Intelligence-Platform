import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAnalyzer } from './ai-analyzer';

describe('AiAnalyzer', () => {
  let component: AiAnalyzer;
  let fixture: ComponentFixture<AiAnalyzer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiAnalyzer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiAnalyzer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
