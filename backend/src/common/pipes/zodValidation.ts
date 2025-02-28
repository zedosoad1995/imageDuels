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
      if (metadata.type !== 'body') {
        return value;
      }

      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (!(error instanceof ZodError)) {
        console.error(error);
        throw new BadRequestException('Validation failed.');
      }

      const messages = error.errors
        .map((err) => `${err.path.join('.')} - ${err.message}`)
        .join(', ');
      throw new BadRequestException(`Validation failed: ${messages}`);
    }
  }
}
