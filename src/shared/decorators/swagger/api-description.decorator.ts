import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnprocessableEntityResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

export interface ApiDescriptionConfig {
  operation: {
    summary: string;
    description: string;
  };
  success: {
    status: 200 | 201;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: Type<any> | [Type<any>];
    description?: string;
  };
  errors: {
    400?: string;
    401?: boolean;
    403?: string;
    404?: string;
    409?: string;
    422?: string;
    500: string;
  };
}

function createErrorSchema(statusCode: number, message: string) {
  return {
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: statusCode },
        message: { type: 'string', example: message },
      },
    },
  };
}

export function ApiDescription(config: ApiDescriptionConfig) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [];

  decorators.push(
    ApiOperation({
      summary: config.operation.summary,
      description: config.operation.description,
    }),
  );

  decorators.push(
    ApiResponse({
      status: config.success.status,
      description: config.success.description || 'Success',
      type: config.success.type,
    }),
  );

  const { errors } = config;

  if (errors[400]) {
    decorators.push(
      ApiBadRequestResponse({
        description: errors[400],
        ...createErrorSchema(400, errors[400]),
      }),
    );
  }

  if (errors[401]) {
    decorators.push(
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
        ...createErrorSchema(401, 'Unauthorized'),
      }),
    );
  }

  if (errors[403]) {
    decorators.push(
      ApiForbiddenResponse({
        description: errors[403],
        ...createErrorSchema(403, errors[403]),
      }),
    );
  }

  if (errors[404]) {
    decorators.push(
      ApiNotFoundResponse({
        description: errors[404],
        ...createErrorSchema(404, errors[404]),
      }),
    );
  }

  if (errors[409]) {
    decorators.push(
      ApiConflictResponse({
        description: errors[409],
        ...createErrorSchema(409, errors[409]),
      }),
    );
  }

  if (errors[422]) {
    decorators.push(
      ApiUnprocessableEntityResponse({
        description: errors[422],
        ...createErrorSchema(422, errors[422]),
      }),
    );
  }

  decorators.push(
    ApiInternalServerErrorResponse({
      description: errors[500],
      ...createErrorSchema(500, errors[500]),
    }),
  );

  return applyDecorators(...decorators);
}
