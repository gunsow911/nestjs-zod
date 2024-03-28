import { ZodIssueBase, ZodIssueCode, ZodIssueOptionalMessage } from 'zod';
export { ZodIssueCode } from 'zod';

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

declare type NestJsZodIssue = ZodAnyDateStringIssue | ZodAnyPasswordIssue;
declare type ZodIssueOptionalMessageExtended = ZodIssueOptionalMessage | NestJsZodIssue | ZodTooSmallIssue | ZodTooBigIssue;
declare type ZodIssueExtended = ZodIssueOptionalMessageExtended & {
    message: string;
};

declare function isNestJsZodIssue(issue: ZodIssueOptionalMessageExtended): issue is NestJsZodIssue;

export { NestJsZodIssue, ZodIssueExtended as ZodIssue, isNestJsZodIssue };
