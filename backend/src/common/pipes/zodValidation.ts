import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (!(error instanceof ZodError)) {
        throw new BadRequestException('Validation failed.');
      }

      const field = error.errors[0].path.join('.');
      const message = error.errors[0].message;
      throw new BadRequestException(`${field}: ${message}`);
    }
  }
}
