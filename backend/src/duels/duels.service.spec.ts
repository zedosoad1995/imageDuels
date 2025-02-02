import { Test, TestingModule } from '@nestjs/testing';
import { DuelsService } from './duels.service';

describe('DuelsService', () => {
  let service: DuelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DuelsService],
    }).compile();

    service = module.get<DuelsService>(DuelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
