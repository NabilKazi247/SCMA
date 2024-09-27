import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenProjectPage } from './open-project.page';

describe('OpenProjectPage', () => {
  let component: OpenProjectPage;
  let fixture: ComponentFixture<OpenProjectPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenProjectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
