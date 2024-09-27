import { TestBed } from '@angular/core/testing';

import { OpenapiService } from './openapi.service';

describe('OpenapiService', () => {
  let service: OpenapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
