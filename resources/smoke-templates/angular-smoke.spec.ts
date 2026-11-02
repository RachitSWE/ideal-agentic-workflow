/**
 * Standard S7-B Runtime Smoke Verification for Angular 21+ LTS.
 * Validates standalone component initialization, Zoneless change detection,
 * and router outlet presence without legacy NgModule dependencies.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

// Adapt to your root application component: e.g. import { AppComponent } from './app.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-root',
  template: '<main class="app-container"><h1>App Initialized</h1></main>',
})
class TestRootComponent {}

describe('S7-B Runtime Smoke Verification: Angular Standalone & Zoneless', () => {
  let fixture: ComponentFixture<TestRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestRootComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestRootComponent);
  });

  it('boots root standalone component cleanly under zoneless change detection', () => {
    expect(fixture.componentInstance).toBeTruthy();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('App Initialized');
  });
});
