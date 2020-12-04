import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocspaSearchComponent } from './docspa-search.component';

describe('DocspaSearchComponent', () => {
  let component: DocspaSearchComponent;
  let fixture: ComponentFixture<DocspaSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocspaSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocspaSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
