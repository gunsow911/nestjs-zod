import * as zod from 'zod';
import { ZodIssueBase, ZodIssueCode, ZodIssueOptionalMessage, ParseContext, ZodErrorMap, ZodTypeDef, ZodSchema, z, ZodType, ParseInput, ParseReturnType } from 'zod';
export * from 'zod';

declare type DateStringFormat = 'date' | 'date-time';
declare type DateStringDirection = 'past' | 'future';
declare type DateStringDayType = 'weekDay' | 'weekend';
interface ZodInvalidDateStringIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params: {
        isNestJsZod: true;
        code: 'invalid_date_string';
    };
}
interface ZodInvalidDateStringFormatIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params: {
        isNestJsZod: true;
        code: 'invalid_date_string_format';
        expected: DateStringFormat;
    };
}
interface ZodInvalidDateStringDirectionIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params: {
        isNestJsZod: true;
        code: 'invalid_date_string_direction';
        expected: DateStringDirection;
    };
}
interface ZodInvalidDateStringDayIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params: {
        isNestJsZod: true;
        code: 'invalid_date_string_day';
        expected: DateStringDayType;
    };
}
declare type ZodAnyDateStringIssue = ZodInvalidDateStringIssue | ZodInvalidDateStringFormatIssue | ZodInvalidDateStringDirectionIssue | ZodInvalidDateStringDayIssue;

declare type ZodMinMaxValueType = 'array' | 'string' | 'number' | 'bigint' | 'set' | 'date_string_year' | 'date' | 'password';
interface ZodTooSmallIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.too_small;
    minimum: number | bigint;
    inclusive: boolean;
    type: ZodMinMaxValueType;
}
interface ZodTooBigIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.too_big;
    maximum: number | bigint;
    inclusive: boolean;
    type: ZodMinMaxValueType;
}

interface ZodInvalidPasswordNoDigit extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params: {
        isNestJsZod: true;
        code: 'invalid_password_no_digit';
    };
}
interface ZodInvalidPasswordNoLowercase extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params: {
        isNestJsZod: true;
        code: 'invalid_password_no_lowercase';
    };
}
interface ZodInvalidPasswordNoUppercase extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params: {
        isNestJsZod: true;
        code: 'invalid_password_no_uppercase';
    };
}
interface ZodInvalidPasswordNoSpecial extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params: {
        isNestJsZod: true;
        code: 'invalid_password_no_special';
    };
}
declare type ZodAnyPasswordIssue = ZodInvalidPasswordNoDigit | ZodInvalidPasswordNoLowercase | ZodInvalidPasswordNoUppercase | ZodInvalidPasswordNoSpecial;

declare type StripPath<T extends object> = T extends any ? Omit<T, 'path'> : never;
declare type NestJsZodIssue = ZodAnyDateStringIssue | ZodAnyPasswordIssue;
declare type ZodIssueOptionalMessageExtended = ZodIssueOptionalMessage | NestJsZodIssue | ZodTooSmallIssue | ZodTooBigIssue;
declare type ZodIssueExtended = ZodIssueOptionalMessageExtended & {
    message: string;
};
declare type IssueDataExtended = StripPath<ZodIssueOptionalMessageExtended> & {
    path?: (string | number)[];
    fatal?: boolean;
};
declare function addIssueToContextExtended(context: ParseContext, issueData: IssueDataExtended): void;

declare type ErrorMapContext = Parameters<ZodErrorMap>[1];
declare type ZodErrorMapExtended = (issue: ZodIssueOptionalMessageExtended, context: ErrorMapContext) => ReturnType<ZodErrorMap>;
declare const extendedErrorMap: ZodErrorMapExtended;
declare function setExtendedErrorMap(map: ZodErrorMapExtended): void;

declare function from<TOutput = any, TDef extends ZodTypeDef = ZodTypeDef, TInput = TOutput>(schema: ZodSchema<TOutput, TDef, TInput>): ZodSchema<TOutput, TDef, TInput>;

declare type Literal = boolean | number | string;
declare type Json = Literal | {
    [key: string]: Json;
} | Json[];
declare const json: (message?: string) => z.ZodType<Json, z.ZodTypeDef, Json>;

declare type ErrorMessage = string | {
    message?: string;
};
interface RawCreateParams {
    errorMap?: ZodErrorMapExtended;
    invalid_type_error?: string;
    required_error?: string;
    description?: string;
}

declare enum ZodFirstPartyTypeKindExtended {
    ZodDateString = "ZodDateString",
    ZodPassword = "ZodPassword"
}

declare type ZodIsoDateCheck = {
    kind: 'format';
    value: DateStringFormat;
    regex: RegExp;
    message?: string;
} | {
    kind: 'direction';
    direction: DateStringDirection;
    message?: string;
} | {
    kind: 'day-type';
    type: DateStringDayType;
    message?: string;
} | {
    kind: 'minYear';
    value: number;
    message?: string;
} | {
    kind: 'maxYear';
    value: number;
    message?: string;
};
interface ZodDateStringDef extends ZodTypeDef {
    checks: ZodIsoDateCheck[];
    typeName: ZodFirstPartyTypeKindExtended.ZodDateString;
}
declare class ZodDateString extends ZodType<string, ZodDateStringDef> {
    _parse(input: ParseInput): ParseReturnType<string>;
    _replaceCheck(check: ZodIsoDateCheck): ZodDateString;
    static create: (params?: RawCreateParams | undefined) => ZodDateString;
    format(format: DateStringFormat, message?: ErrorMessage): ZodDateString;
    past(message?: ErrorMessage): ZodDateString;
    future(message?: ErrorMessage): ZodDateString;
    weekDay(message?: ErrorMessage): ZodDateString;
    weekend(message?: ErrorMessage): ZodDateString;
    minYear(year: number, message?: ErrorMessage): ZodDateString;
    maxYear(year: number, message?: ErrorMessage): ZodDateString;
    cast(): zod.ZodEffects<this, Date, zod.input<this>>;
    get format_(): ({
        kind: "format";
    } & {
        kind: "format";
        value: DateStringFormat;
        regex: RegExp;
        message?: string | undefined;
    }) | undefined;
    get isPast(): boolean;
    get isFuture(): boolean;
    get isWeekDay(): boolean;
    get isWeekend(): boolean;
    get minYear_(): ({
        kind: "minYear";
    } & {
        kind: "minYear";
        value: number;
        message?: string | undefined;
    }) | undefined;
    get maxYear_(): ({
        kind: "maxYear";
    } & {
        kind: "maxYear";
        value: number;
        message?: string | undefined;
    }) | undefined;
}
declare const dateString: (params?: RawCreateParams | undefined) => ZodDateString;

declare type SymbolKind = 'digit' | 'lowercase' | 'uppercase' | 'special';
interface ZodPasswordSymbolCheck {
    kind: SymbolKind;
    message?: string;
}
declare type ZodPasswordCheck = ZodPasswordSymbolCheck | {
    kind: 'minLength';
    value: number;
    message?: string;
} | {
    kind: 'maxLength';
    value: number;
    message?: string;
};
interface ZodPasswordDef extends ZodTypeDef {
    checks: ZodPasswordCheck[];
    typeName: ZodFirstPartyTypeKindExtended.ZodPassword;
}
declare class ZodPassword extends ZodType<string, ZodPasswordDef> {
    _parse(input: ParseInput): ParseReturnType<string>;
    _replaceCheck(check: ZodPasswordCheck): ZodPassword;
    static create: (params?: RawCreateParams | undefined) => ZodPassword;
    buildFullRegExp(): RegExp;
    atLeastOne(kind: SymbolKind, message?: ErrorMessage): ZodPassword;
    min(length: number, message?: ErrorMessage): ZodPassword;
    max(length: number, message?: ErrorMessage): ZodPassword;
    isAtLeastOne(kind: SymbolKind): boolean;
    get minLength(): ({
        kind: "minLength";
    } & {
        kind: "minLength";
        value: number;
        message?: string | undefined;
    }) | undefined;
    get maxLength(): ({
        kind: "maxLength";
    } & {
        kind: "maxLength";
        value: number;
        message?: string | undefined;
    }) | undefined;
}
declare const password: (params?: RawCreateParams | undefined) => ZodPassword;

export { Json, ZodDateString, ZodDateStringDef, ZodErrorMapExtended as ZodErrorMap, ZodFirstPartyTypeKindExtended, ZodInvalidDateStringDayIssue, ZodIssueExtended as ZodIssue, ZodIssueOptionalMessageExtended as ZodIssueOptionalMessage, ZodPassword, ZodPasswordDef, ZodTooBigIssue, ZodTooSmallIssue, addIssueToContextExtended as addIssueToContext, dateString, extendedErrorMap as defaultErrorMap, from, json, password, setExtendedErrorMap as setErrorMap };
