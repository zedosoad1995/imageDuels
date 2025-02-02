import { Test, TestingModule } from '@nestjs/testing';
import { DuelsController } from './duels.controller';

describe('DuelsController', () => {
  let controller: DuelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DuelsController],
    }).compile();

    controller = module.get<DuelsController>(DuelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
