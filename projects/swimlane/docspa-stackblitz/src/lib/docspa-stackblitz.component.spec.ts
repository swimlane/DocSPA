import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbedStackblitzComponent } from './docspa-stackblitz.component';

describe('EmbedStackblitzComponent', () => {
  let component: EmbedStackblitzComponent;
  let fixture: ComponentFixture<EmbedStackblitzComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmbedStackblitzComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbedStackblitzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
