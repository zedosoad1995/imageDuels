import { Test, TestingModule } from '@nestjs/testing';
import { Glicko2Service } from './glicko2.service';

describe('Glicko2Service', () => {
  let service: Glicko2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Glicko2Service],
    }).compile();

    service = module.get<Glicko2Service>(Glicko2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
