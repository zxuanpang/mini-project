import { TestBed } from '@angular/core/testing';

import { GenderApiService } from './gender-api.service';

describe('GenderApiService', () => {
  let service: GenderApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenderApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
