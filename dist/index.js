'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common = require('@nestjs/common');
var mergeDeep = require('merge-deep');
var zod = require('zod');
var rxjs = require('rxjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

function _mergeNamespaces(n, m) {
  m.forEach(function (e) {
    e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
      if (k !== 'default' && !(k in n)) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  });
  return Object.freeze(n);
}

var mergeDeep__default = /*#__PURE__*/_interopDefaultLegacy(mergeDeep);
var zod__namespace = /*#__PURE__*/_interopNamespace(zod);

function createZodDto(schema) {
  class AugmentedZodDto {
    static create(input) {
      return this.schema.parse(input);
    }
  }
  AugmentedZodDto.isZodDto = true;
  AugmentedZodDto.schema = schema;
  return AugmentedZodDto;
}
function isZodDto(metatype) {
  return metatype == null ? void 0 : metatype.isZodDto;
}

class ZodValidationException extends common.BadRequestException {
  constructor(error) {
    super({
      statusCode: common.HttpStatus.BAD_REQUEST,
      message: "Validation failed",
      errors: error.errors
    });
    this.error = error;
  }
  getZodError() {
    return this.error;
  }
}
class ZodSerializationException extends common.InternalServerErrorException {
  constructor(error) {
    super();
    this.error = error;
  }
  getZodError() {
    return this.error;
  }
}
const createZodValidationException = (error) => {
  return new ZodValidationException(error);
};
const createZodSerializationException = (error) => {
  return new ZodSerializationException(error);
};

function validate(value, schemaOrDto, createValidationException = createZodValidationException) {
  const schema = isZodDto(schemaOrDto) ? schemaOrDto.schema : schemaOrDto;
  const result = schema.safeParse(value);
  if (!result.success) {
    throw createValidationException(result.error);
  }
  return result.data;
}

var __defProp$4 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __decorateClass$2 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$2(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp$4(target, key, result);
  return result;
};
function createZodGuard({
  createValidationException
} = {}) {
  let ZodGuard2 = class {
    constructor(source, schemaOrDto) {
      this.source = source;
      this.schemaOrDto = schemaOrDto;
    }
    canActivate(context) {
      const data = context.switchToHttp().getRequest()[this.source];
      validate(data, this.schemaOrDto, createValidationException);
      return true;
    }
  };
  ZodGuard2 = __decorateClass$2([
    common.Injectable()
  ], ZodGuard2);
  return ZodGuard2;
}
const ZodGuard = createZodGuard();
const UseZodGuard = (source, schemaOrDto) => common.UseGuards(new ZodGuard(source, schemaOrDto));

const CUSTOM_ISSUE_CODE = "custom";
function isNestJsZodIssue(issue) {
  var _a;
  return issue.code === CUSTOM_ISSUE_CODE && ((_a = issue.params) == null ? void 0 : _a.isNestJsZod);
}

function composeMappers(mappers) {
  return (issue) => {
    for (const mapper of mappers) {
      const result = mapper(issue);
      if (!result.matched)
        continue;
      return result;
    }
    return { matched: false };
  };
}
function createCustomMapper(map) {
  return (issue) => {
    if (!isNestJsZodIssue(issue))
      return { matched: false };
    const result = map(issue.params);
    if (!result.matched)
      return { matched: false };
    return result;
  };
}
function createMinMaxMapper(valueType, map) {
  return (issue) => {
    if (issue.code !== zod.ZodIssueCode.too_small && issue.code !== zod.ZodIssueCode.too_big) {
      return { matched: false };
    }
    if (issue.type !== valueType) {
      return { matched: false };
    }
    const result = map(issue);
    if (!result.matched)
      return { matched: false };
    return result;
  };
}

const dateStringCustom = createCustomMapper((params) => {
  if (params.code === "invalid_date_string") {
    const message = `Invalid string, expected it to be a valid date`;
    return { matched: true, message };
  }
  if (params.code === "invalid_date_string_format") {
    const mapper = {
      "date": 'YYYY-MM-DD (RFC3339 "full-date")',
      "date-time": 'YYYY-MM-DDTHH:mm:ssZ (RFC3339 "date-time")'
    };
    const readable = mapper[params.expected];
    const message = `Invalid date, expected it to match ${readable}`;
    return { matched: true, message };
  }
  if (params.code === "invalid_date_string_direction") {
    const message = `Invalid date, expected it to be the ${params.expected}`;
    return { matched: true, message };
  }
  if (params.code === "invalid_date_string_day") {
    const mapper = {
      weekDay: "week day",
      weekend: "weekend"
    };
    const readable = mapper[params.expected];
    const message = `Invalid date, expected it to be a ${readable}`;
    return { matched: true, message };
  }
  return { matched: false };
});
const dateStringYearMinMax = createMinMaxMapper("date_string_year", (issue) => {
  if (issue.code === zod.ZodIssueCode.too_small) {
    const appendix = issue.inclusive ? "or equal to " : "";
    const message = `Year must be greater than ${appendix}${issue.minimum}`;
    return { matched: true, message };
  }
  if (issue.code === zod.ZodIssueCode.too_big) {
    const appendix = issue.inclusive ? "or equal to " : "";
    const message = `Year must be less than ${appendix}${issue.maximum}`;
    return { matched: true, message };
  }
  return { matched: false };
});

const passwordCustom = createCustomMapper((params) => {
  if (params.code === "invalid_password_no_digit") {
    const message = `Password must contain at least one digit`;
    return { matched: true, message };
  }
  if (params.code === "invalid_password_no_lowercase") {
    const message = `Password must contain at least one lowercase letter`;
    return { matched: true, message };
  }
  if (params.code === "invalid_password_no_uppercase") {
    const message = `Password must contain at least one uppercase letter`;
    return { matched: true, message };
  }
  if (params.code === "invalid_password_no_special") {
    const message = `Password must contain at least one special symbol`;
    return { matched: true, message };
  }
  return { matched: false };
});
const passwordMinMax = createMinMaxMapper("password", (issue) => {
  if (issue.code === zod.ZodIssueCode.too_small) {
    const appendix = issue.inclusive ? "or equal to " : "";
    const message = `Password length must be greater than ${appendix}${issue.minimum}`;
    return { matched: true, message };
  }
  if (issue.code === zod.ZodIssueCode.too_big) {
    const appendix = issue.inclusive ? "or equal to " : "";
    const message = `Password length must be less than ${appendix}${issue.maximum}`;
    return { matched: true, message };
  }
  return { matched: false };
});

const mapper = composeMappers([
  dateStringCustom,
  dateStringYearMinMax,
  passwordCustom,
  passwordMinMax
]);
const extendedErrorMap = (issue, context) => {
  const result = mapper(issue);
  if (result.matched) {
    return { message: result.message };
  }
  return zod.defaultErrorMap(issue, context);
};
function setExtendedErrorMap(map) {
  zod.setErrorMap(map);
}
setExtendedErrorMap(extendedErrorMap);

function from(schema) {
  return schema;
}

const literal = zod.z.union([zod.z.string(), zod.z.number(), zod.z.boolean()]);
const DEFAULT_MESSAGE = "Expected value to be a JSON-serializable";
const json = (message = DEFAULT_MESSAGE) => {
  const schema = zod.z.lazy(() => zod.z.union([literal, zod.z.array(schema), zod.z.record(schema)], {
    invalid_type_error: message
  }));
  return schema;
};

function addIssueToContextExtended(context, issueData) {
  zod.addIssueToContext(context, issueData);
}

function normalizeErrorMessage(message) {
  if (typeof message === "string")
    return { message };
  return message;
}
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid" or "required" in conjunction with custom error map.`);
  }
  if (errorMap)
    return { errorMap, description };
  const customMap = (issue, context) => {
    if (issue.code !== "invalid_type")
      return { message: context.defaultError };
    if (typeof context.data === "undefined" && required_error)
      return { message: required_error };
    if (params.invalid_type_error)
      return { message: params.invalid_type_error };
    return { message: context.defaultError };
  };
  return { errorMap: customMap, description };
}
function findCheck(checks, kind) {
  return checks.find((check) => check.kind === kind);
}
function hasCheck(checks, kind) {
  return Boolean(findCheck(checks, kind));
}

var ZodFirstPartyTypeKindExtended = /* @__PURE__ */ ((ZodFirstPartyTypeKindExtended2) => {
  ZodFirstPartyTypeKindExtended2["ZodDateString"] = "ZodDateString";
  ZodFirstPartyTypeKindExtended2["ZodPassword"] = "ZodPassword";
  return ZodFirstPartyTypeKindExtended2;
})(ZodFirstPartyTypeKindExtended || {});

var __defProp$3 = Object.defineProperty;
var __defProps$1 = Object.defineProperties;
var __getOwnPropDescs$1 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$1 = (a, b) => __defProps$1(a, __getOwnPropDescs$1(b));
const formatToRegex = {
  "date": /^\d{4}-\d{2}-\d{2}$/,
  "date-time": /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(|\.\d{3})(Z|[+-]\d{2}:\d{2})$/
};
const _ZodDateString = class extends zod.ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    const context = this._getOrReturnCtx(input);
    if (parsedType !== zod.ZodParsedType.string) {
      addIssueToContextExtended(context, {
        code: zod.ZodIssueCode.invalid_type,
        expected: zod.ZodParsedType.string,
        received: context.parsedType
      });
      return zod.INVALID;
    }
    const date = new Date(input.data);
    if (Number.isNaN(date.getTime())) {
      addIssueToContextExtended(context, {
        code: zod.ZodIssueCode.custom,
        message: "Invalid date string",
        params: {
          isNestJsZod: true,
          code: "invalid_date_string"
        }
      });
      return zod.INVALID;
    }
    const status = new zod.ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "format") {
        const valid = check.regex.test(input.data);
        if (valid)
          continue;
        addIssueToContextExtended(context, {
          code: zod.ZodIssueCode.custom,
          message: check.message,
          params: {
            isNestJsZod: true,
            code: "invalid_date_string_format",
            expected: check.value
          }
        });
        status.dirty();
      } else if (check.kind === "direction") {
        const conditions = {
          past: date < new Date(),
          future: date > new Date()
        };
        const valid = conditions[check.direction];
        if (valid)
          continue;
        addIssueToContextExtended(context, {
          code: zod.ZodIssueCode.custom,
          message: check.message,
          params: {
            isNestJsZod: true,
            code: "invalid_date_string_direction",
            expected: check.direction
          }
        });
        status.dirty();
      } else if (check.kind === "day-type") {
        const day = date.getDay();
        const conditions = {
          weekDay: day !== 0 && day !== 6,
          weekend: day === 0 || day === 6
        };
        const valid = conditions[check.type];
        if (valid)
          continue;
        addIssueToContextExtended(context, {
          code: zod.ZodIssueCode.custom,
          message: check.message,
          params: {
            isNestJsZod: true,
            code: "invalid_date_string_day",
            expected: check.type
          }
        });
        status.dirty();
      } else if (check.kind === "minYear") {
        const valid = date.getFullYear() >= check.value;
        if (valid)
          continue;
        addIssueToContextExtended(context, {
          code: zod.ZodIssueCode.too_small,
          type: "date_string_year",
          minimum: check.value,
          inclusive: true,
          message: check.message
        });
        status.dirty();
      } else if (check.kind === "maxYear") {
        const valid = date.getFullYear() <= check.value;
        if (valid)
          continue;
        addIssueToContextExtended(context, {
          code: zod.ZodIssueCode.too_big,
          type: "date_string_year",
          maximum: check.value,
          inclusive: true,
          message: check.message
        });
        status.dirty();
      }
    }
    return { status: status.value, value: input.data };
  }
  _replaceCheck(check) {
    return new _ZodDateString(__spreadProps$1(__spreadValues$1({}, this._def), {
      checks: this._def.checks.filter((item) => item.kind !== check.kind).concat(check)
    }));
  }
  format(format, message) {
    return this._replaceCheck(__spreadValues$1({
      kind: "format",
      value: format,
      regex: formatToRegex[format]
    }, normalizeErrorMessage(message)));
  }
  past(message) {
    return this._replaceCheck(__spreadValues$1({
      kind: "direction",
      direction: "past"
    }, normalizeErrorMessage(message)));
  }
  future(message) {
    return this._replaceCheck(__spreadValues$1({
      kind: "direction",
      direction: "future"
    }, normalizeErrorMessage(message)));
  }
  weekDay(message) {
    return this._replaceCheck(__spreadValues$1({
      kind: "day-type",
      type: "weekDay"
    }, normalizeErrorMessage(message)));
  }
  weekend(message) {
    return this._replaceCheck(__spreadValues$1({
      kind: "day-type",
      type: "weekend"
    }, normalizeErrorMessage(message)));
  }
  minYear(year, message) {
    return this._replaceCheck(__spreadValues$1({
      kind: "minYear",
      value: year
    }, normalizeErrorMessage(message)));
  }
  maxYear(year, message) {
    return this._replaceCheck(__spreadValues$1({
      kind: "maxYear",
      value: year
    }, normalizeErrorMessage(message)));
  }
  cast() {
    return this.transform((string) => new Date(string));
  }
  get format_() {
    return findCheck(this._def.checks, "format");
  }
  get isPast() {
    var _a;
    return ((_a = findCheck(this._def.checks, "direction")) == null ? void 0 : _a.direction) === "past";
  }
  get isFuture() {
    var _a;
    return ((_a = findCheck(this._def.checks, "direction")) == null ? void 0 : _a.direction) === "future";
  }
  get isWeekDay() {
    var _a;
    return ((_a = findCheck(this._def.checks, "day-type")) == null ? void 0 : _a.type) === "weekDay";
  }
  get isWeekend() {
    var _a;
    return ((_a = findCheck(this._def.checks, "day-type")) == null ? void 0 : _a.type) === "weekend";
  }
  get minYear_() {
    return findCheck(this._def.checks, "minYear");
  }
  get maxYear_() {
    return findCheck(this._def.checks, "maxYear");
  }
};
let ZodDateString = _ZodDateString;
ZodDateString.create = (params) => {
  return new _ZodDateString(__spreadValues$1({
    checks: [
      {
        kind: "format",
        value: "date-time",
        regex: formatToRegex["date-time"]
      }
    ],
    typeName: ZodFirstPartyTypeKindExtended.ZodDateString
  }, processCreateParams(params)));
};
const dateString = ZodDateString.create;

var __defProp$2 = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
const SYMBOL_KINDS = [
  "digit",
  "lowercase",
  "uppercase",
  "special"
];
const REGEXPS = {
  digit: /\d/,
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  special: /[!?@#$%^&*{};.,:%№"|\\/()\-_+=<>`~[\]'"]/
};
function isSymbolCheck(check) {
  return SYMBOL_KINDS.includes(check.kind);
}
const _ZodPassword = class extends zod.ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    const context = this._getOrReturnCtx(input);
    if (parsedType !== zod.ZodParsedType.string) {
      addIssueToContextExtended(context, {
        code: zod.ZodIssueCode.invalid_type,
        expected: zod.ZodParsedType.string,
        received: context.parsedType
      });
      return zod.INVALID;
    }
    const status = new zod.ParseStatus();
    for (const check of this._def.checks) {
      if (isSymbolCheck(check)) {
        const valid = REGEXPS[check.kind].test(input.data);
        if (valid)
          continue;
        addIssueToContextExtended(context, {
          code: zod.ZodIssueCode.custom,
          message: check.message,
          params: {
            isNestJsZod: true,
            code: `invalid_password_no_${check.kind}`
          }
        });
        status.dirty();
      } else if (check.kind === "minLength") {
        const valid = input.data.length >= check.value;
        if (valid)
          continue;
        addIssueToContextExtended(context, {
          code: zod.ZodIssueCode.too_small,
          type: "password",
          minimum: check.value,
          inclusive: true,
          message: check.message
        });
        status.dirty();
      } else if (check.kind === "maxLength") {
        const valid = input.data.length <= check.value;
        if (valid)
          continue;
        addIssueToContextExtended(context, {
          code: zod.ZodIssueCode.too_big,
          type: "password",
          maximum: check.value,
          inclusive: true,
          message: check.message
        });
        status.dirty();
      }
    }
    return { status: status.value, value: input.data };
  }
  _replaceCheck(check) {
    return new _ZodPassword(__spreadProps(__spreadValues({}, this._def), {
      checks: this._def.checks.filter((item) => item.kind !== check.kind).concat(check)
    }));
  }
  buildFullRegExp() {
    const lookaheads = [];
    for (const check of this._def.checks) {
      if (!isSymbolCheck(check))
        continue;
      const regex = REGEXPS[check.kind];
      lookaheads.push(`(?=.*${regex.source})`);
    }
    if (lookaheads.length === 0) {
      return /^.*$/;
    }
    const union = lookaheads.join("");
    return new RegExp(`^(?:${union}.*)$`);
  }
  atLeastOne(kind, message) {
    return this._replaceCheck(__spreadValues({
      kind
    }, normalizeErrorMessage(message)));
  }
  min(length, message) {
    return this._replaceCheck(__spreadValues({
      kind: "minLength",
      value: length
    }, normalizeErrorMessage(message)));
  }
  max(length, message) {
    return this._replaceCheck(__spreadValues({
      kind: "maxLength",
      value: length
    }, normalizeErrorMessage(message)));
  }
  isAtLeastOne(kind) {
    return hasCheck(this._def.checks, kind);
  }
  get minLength() {
    return findCheck(this._def.checks, "minLength");
  }
  get maxLength() {
    return findCheck(this._def.checks, "maxLength");
  }
};
let ZodPassword = _ZodPassword;
ZodPassword.create = (params) => {
  return new _ZodPassword(__spreadValues({
    checks: [],
    typeName: ZodFirstPartyTypeKindExtended.ZodPassword
  }, processCreateParams(params)));
};
const password = ZodPassword.create;

var z = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  defaultErrorMap: extendedErrorMap,
  setErrorMap: setExtendedErrorMap,
  addIssueToContext: addIssueToContextExtended,
  from: from,
  json: json,
  ZodDateString: ZodDateString,
  dateString: dateString,
  ZodPassword: ZodPassword,
  password: password,
  ZodFirstPartyTypeKindExtended: ZodFirstPartyTypeKindExtended
}, [zod__namespace]);

function is(input, factory) {
  const factories = z;
  return factory === factories[input._def.typeName];
}
function zodToOpenAPI(zodType, visited = /* @__PURE__ */ new Set()) {
  const object = {};
  if (zodType.description) {
    object.description = zodType.description;
  }
  if (is(zodType, zod.ZodString)) {
    const { checks } = zodType._def;
    object.type = "string";
    for (const check of checks) {
      if (check.kind === "min") {
        object.minLength = check.value;
      } else if (check.kind === "max") {
        object.maxLength = check.value;
      } else if (check.kind === "email") {
        object.format = "email";
      } else if (check.kind === "url") {
        object.format = "uri";
      } else if (check.kind === "uuid") {
        object.format = "uuid";
      } else if (check.kind === "cuid") {
        object.format = "cuid";
      } else if (check.kind === "regex") {
        object.pattern = check.regex.source;
      } else if (check.kind === "datetime") {
        object.format = "date-time";
      }
    }
  }
  if (is(zodType, ZodPassword)) {
    const { checks } = zodType._def;
    const regex = zodType.buildFullRegExp();
    object.type = "string";
    object.format = "password";
    object.pattern = regex.source;
    for (const check of checks) {
      if (check.kind === "minLength") {
        object.minLength = check.value;
      } else if (check.kind === "maxLength") {
        object.maxLength = check.value;
      }
    }
  }
  if (is(zodType, zod.ZodBoolean)) {
    object.type = "boolean";
  }
  if (is(zodType, zod.ZodNumber)) {
    const { checks } = zodType._def;
    object.type = "number";
    for (const check of checks) {
      if (check.kind === "int") {
        object.type = "integer";
      } else if (check.kind === "min") {
        object.minimum = check.value;
        object.exclusiveMinimum = !check.inclusive;
      } else if (check.kind === "max") {
        object.maximum = check.value;
        object.exclusiveMaximum = !check.inclusive;
      } else if (check.kind === "multipleOf") {
        object.multipleOf = check.value;
      }
    }
  }
  if (is(zodType, ZodDateString)) {
    const { checks } = zodType._def;
    object.type = "string";
    for (const check of checks) {
      if (check.kind === "format") {
        object.format = check.value;
      }
    }
  }
  if (is(zodType, zod.ZodDate)) {
    object.type = "string";
    object.format = "date-time";
  }
  if (is(zodType, zod.ZodBigInt)) {
    object.type = "integer";
    object.format = "int64";
  }
  if (is(zodType, zod.ZodArray)) {
    const { minLength, maxLength, type } = zodType._def;
    object.type = "array";
    if (minLength)
      object.minItems = minLength.value;
    if (maxLength)
      object.maxItems = maxLength.value;
    object.items = zodToOpenAPI(type, visited);
  }
  if (is(zodType, zod.ZodTuple)) {
    const { items } = zodType._def;
    object.type = "array";
    object.items = { oneOf: items.map((item) => zodToOpenAPI(item, visited)) };
  }
  if (is(zodType, zod.ZodSet)) {
    const { valueType, minSize, maxSize } = zodType._def;
    object.type = "array";
    if (minSize)
      object.minItems = minSize.value;
    if (maxSize)
      object.maxItems = maxSize.value;
    object.items = zodToOpenAPI(valueType, visited);
    object.uniqueItems = true;
  }
  if (is(zodType, zod.ZodUnion)) {
    const { options } = zodType._def;
    object.oneOf = options.map((option) => zodToOpenAPI(option, visited));
  }
  if (is(zodType, zod.ZodDiscriminatedUnion)) {
    const { options } = zodType._def;
    object.oneOf = [];
    for (const schema of options.values()) {
      object.oneOf.push(zodToOpenAPI(schema, visited));
    }
  }
  if (is(zodType, zod.ZodLiteral)) {
    const { value } = zodType._def;
    if (typeof value === "string") {
      object.type = "string";
      object.enum = [value];
    }
    if (typeof value === "number") {
      object.type = "number";
      object.minimum = value;
      object.maximum = value;
    }
    if (typeof value === "boolean") {
      object.type = "boolean";
    }
  }
  if (is(zodType, zod.ZodEnum)) {
    const { values } = zodType._def;
    object.type = "string";
    object.enum = values;
  }
  if (is(zodType, zod.ZodNativeEnum)) {
    const { values } = zodType._def;
    object.type = "string";
    object.enum = Object.values(values);
    object["x-enumNames"] = Object.keys(values);
  }
  if (is(zodType, zod.ZodTransformer)) {
    const { schema } = zodType._def;
    Object.assign(object, zodToOpenAPI(schema, visited));
  }
  if (is(zodType, zod.ZodNullable)) {
    const { innerType } = zodType._def;
    Object.assign(object, zodToOpenAPI(innerType, visited));
    object.nullable = true;
  }
  if (is(zodType, zod.ZodOptional)) {
    const { innerType } = zodType._def;
    Object.assign(object, zodToOpenAPI(innerType, visited));
  }
  if (is(zodType, zod.ZodDefault)) {
    const { defaultValue, innerType } = zodType._def;
    Object.assign(object, zodToOpenAPI(innerType, visited));
    object.default = defaultValue();
  }
  if (is(zodType, zod.ZodObject)) {
    const { shape } = zodType._def;
    object.type = "object";
    object.properties = {};
    object.required = [];
    for (const [key, schema] of Object.entries(shape())) {
      object.properties[key] = zodToOpenAPI(schema, visited);
      const optionalTypes = [zod.ZodOptional.name, zod.ZodDefault.name];
      const isOptional = optionalTypes.includes(schema.constructor.name);
      if (!isOptional)
        object.required.push(key);
    }
    if (object.required.length === 0) {
      delete object.required;
    }
  }
  if (is(zodType, zod.ZodRecord)) {
    const { valueType } = zodType._def;
    object.type = "object";
    object.additionalProperties = zodToOpenAPI(valueType, visited);
  }
  if (is(zodType, zod.ZodIntersection)) {
    const { left, right } = zodType._def;
    const merged = mergeDeep__default["default"](zodToOpenAPI(left, visited), zodToOpenAPI(right, visited));
    Object.assign(object, merged);
  }
  if (is(zodType, zod.ZodEffects)) {
    const { schema } = zodType._def;
    Object.assign(object, zodToOpenAPI(schema, visited));
  }
  if (is(zodType, zod.ZodLazy)) {
    const { getter } = zodType._def;
    if (visited.has(getter))
      return object;
    visited.add(getter);
    Object.assign(object, zodToOpenAPI(getter(), visited));
  }
  return object;
}

function getSchemaObjectFactory() {
  return require("@nestjs/swagger/dist/services/schema-object-factory").SchemaObjectFactory;
}
function patchNestJsSwagger(SchemaObjectFactory = getSchemaObjectFactory()) {
  if (SchemaObjectFactory.prototype.__patchedWithLoveByNestjsZod)
    return;
  const defaultExplore = SchemaObjectFactory.prototype.exploreModelSchema;
  const extendedExplore = function exploreModelSchema(type, schemas, schemaRefsStack) {
    if (this && this["isLazyTypeFunc"](type)) {
      const factory = type;
      type = factory();
    }
    if (!isZodDto(type)) {
      return defaultExplore.call(this, type, schemas, schemaRefsStack);
    }
    schemas[type.name] = zodToOpenAPI(type.schema);
    return type.name;
  };
  SchemaObjectFactory.prototype.exploreModelSchema = extendedExplore;
  SchemaObjectFactory.prototype.__patchedWithLoveByNestjsZod = true;
}

var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp$1(target, key, result);
  return result;
};
function createZodValidationPipe({
  createValidationException
} = {}) {
  let ZodValidationPipe2 = class {
    constructor(schemaOrDto) {
      this.schemaOrDto = schemaOrDto;
    }
    transform(value, metadata) {
      if (this.schemaOrDto) {
        return validate(value, this.schemaOrDto, createValidationException);
      }
      const { metatype } = metadata;
      if (!isZodDto(metatype)) {
        return value;
      }
      return validate(value, metatype.schema, createValidationException);
    }
  };
  ZodValidationPipe2 = __decorateClass$1([
    common.Injectable()
  ], ZodValidationPipe2);
  return ZodValidationPipe2;
}
const ZodValidationPipe = createZodValidationPipe();

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
const REFLECTOR = "Reflector";
const ZodSerializerDtoOptions = "ZOD_SERIALIZER_DTO_OPTIONS";
const ZodSerializerDto = (dto) => common.SetMetadata(ZodSerializerDtoOptions, dto);
exports.ZodSerializerInterceptor = class {
  constructor(reflector) {
    this.reflector = reflector;
  }
  intercept(context, next) {
    const responseSchema = this.getContextResponseSchema(context);
    return next.handle().pipe(rxjs.map((res) => {
      if (!responseSchema)
        return res;
      if (typeof res !== "object" || res instanceof common.StreamableFile)
        return res;
      return Array.isArray(res) ? res.map((item) => validate(item, responseSchema, createZodSerializationException)) : validate(res, responseSchema, createZodSerializationException);
    }));
  }
  getContextResponseSchema(context) {
    return this.reflector.getAllAndOverride(ZodSerializerDtoOptions, [
      context.getHandler(),
      context.getClass()
    ]);
  }
};
exports.ZodSerializerInterceptor = __decorateClass([
  common.Injectable(),
  __decorateParam(0, common.Inject(REFLECTOR))
], exports.ZodSerializerInterceptor);

exports.UseZodGuard = UseZodGuard;
exports.ZodGuard = ZodGuard;
exports.ZodSerializerDto = ZodSerializerDto;
exports.ZodValidationException = ZodValidationException;
exports.ZodValidationPipe = ZodValidationPipe;
exports.createZodDto = createZodDto;
exports.createZodGuard = createZodGuard;
exports.createZodValidationPipe = createZodValidationPipe;
exports.patchNestJsSwagger = patchNestJsSwagger;
exports.validate = validate;
exports.zodToOpenAPI = zodToOpenAPI;
