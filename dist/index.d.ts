import { ZodTypeDef, ZodSchema, ZodError, ZodTypeAny } from 'zod';
import * as _nestjs_common from '@nestjs/common';
import { BadRequestException, CanActivate, Type, PipeTransform, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { SchemaObjectFactory } from '@nestjs/swagger/dist/services/schema-object-factory';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Observable } from 'rxjs';

interface ZodDto<TOutput = any, TDef extends ZodTypeDef = ZodTypeDef, TInput = TOutput> {
    new (): TOutput;
    isZodDto: true;
    schema: ZodSchema<TOutput, TDef, TInput>;
    create(input: unknown): TOutput;
}
declare function createZodDto<TOutput = any, TDef extends ZodTypeDef = ZodTypeDef, TInput = TOutput>(schema: ZodSchema<TOutput, TDef, TInput>): ZodDto<TOutput, TDef, TInput>;

declare class ZodValidationException extends BadRequestException {
    private error;
    constructor(error: ZodError);
    getZodError(): ZodError<any>;
}
declare type ZodExceptionCreator = (error: ZodError) => Error;

declare type Source = 'body' | 'query' | 'params';

interface ZodBodyGuardOptions {
    createValidationException?: ZodExceptionCreator;
}
declare type ZodGuardClass = new (source: Source, schemaOrDto: ZodSchema | ZodDto) => CanActivate;
declare function createZodGuard({ createValidationException, }?: ZodBodyGuardOptions): ZodGuardClass;
declare const ZodGuard: ZodGuardClass;
declare const UseZodGuard: (source: Source, schemaOrDto: ZodSchema | ZodDto) => MethodDecorator & ClassDecorator;

declare function patchNestJsSwagger(SchemaObjectFactory?: Type<SchemaObjectFactory>): void;

interface ExtendedSchemaObject extends SchemaObject {
    [key: `x-${string}`]: any;
}
declare function zodToOpenAPI(zodType: ZodTypeAny, visited?: Set<any>): ExtendedSchemaObject;

interface ZodValidationPipeOptions {
    createValidationException?: ZodExceptionCreator;
}
declare type ZodValidationPipeClass = new (schemaOrDto?: ZodSchema | ZodDto) => PipeTransform;
declare function createZodValidationPipe({ createValidationException, }?: ZodValidationPipeOptions): ZodValidationPipeClass;
declare const ZodValidationPipe: ZodValidationPipeClass;

declare const ZodSerializerDto: (dto: ZodDto | ZodSchema) => _nestjs_common.CustomDecorator<"ZOD_SERIALIZER_DTO_OPTIONS">;
declare class ZodSerializerInterceptor implements NestInterceptor {
    protected readonly reflector: any;
    constructor(reflector: any);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    protected getContextResponseSchema(context: ExecutionContext): ZodDto | ZodSchema | undefined;
}

declare function validate<TOutput = any, // eslint-disable-line @typescript-eslint/no-explicit-any
TDef extends ZodTypeDef = ZodTypeDef, TInput = TOutput>(value: unknown, schemaOrDto: ZodSchema<TOutput, TDef, TInput> | ZodDto<TOutput, TDef, TInput>, createValidationException?: ZodExceptionCreator): TOutput;

export { UseZodGuard, ZodDto, ZodGuard, ZodSerializerDto, ZodSerializerInterceptor, ZodValidationException, ZodValidationPipe, createZodDto, createZodGuard, createZodValidationPipe, patchNestJsSwagger, validate, zodToOpenAPI };
