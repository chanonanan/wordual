import { TestBed } from '@angular/core/testing';

import { AblyService } from './ably.service';

describe('AblyService', () => {
  let service: AblyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AblyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
