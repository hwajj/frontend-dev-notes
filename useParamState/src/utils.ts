utils.import dayjs from 'dayjs';

import { isArray, isBoolean, isIn, isString } from '../../utils/type/typeCheck';
import { ARRAY_ITEM_DELIMITER, DATE_FULL_FORMAT, EMPTY_ARRAY_IDENTIFIER, FALSE, TRUE } from './const';
import { RawValue } from './types'

export const isValid = {
  boolean: (v: RawValue) => isIn([TRUE, FALSE], v),
  number: (v: RawValue) => !!v && !Number.isNaN(Number(v)), // null 제외
  date: (v: RawValue) => dayjs(v).isValid(),
  array: (v: RawValue) => v !== null && (v === EMPTY_ARRAY_IDENTIFIER || v.split(ARRAY_ITEM_DELIMITER).length > 1),
  /** 값이 제한된 string */
  record: (record: Record<string, string>) => (v: RawValue) => v !== null && Object.values(record).includes(v),
  /** 값이 제한된 배열 */
  tuple: (record: Record<string, string>) => (v: RawValue) => {
    const isInRecord = isValid.record(record)
    const entries = v?.split(ARRAY_ITEM_DELIMITER) ?? []

    return v === EMPTY_ARRAY_IDENTIFIER || (entries.length > 1 && entries.filter(Boolean).every(isInRecord))
  },
}

/** JavaScript 원시값 또는 URL parameter 값이 어떤 타입인지 체크 */
export const is = {
  boolean: (v: unknown) => isBoolean(v) || isIn([TRUE, FALSE], v),
  number: (v: unknown) => !!v && !Number.isNaN(Number(v)),
  date: (v: unknown): v is string => isString(v) && !!v.match(DATE_FULL_FORMAT),
  empty: (v: unknown) => v === null || v === undefined || v === '',
  /** JavaScript 배열 또는 trailing comma가 포함된 문자열 `"a,b," 또는 빈 배열 식별자 */
  array: (v: unknown) => isArray(v) ||
    (isString(v) && (v.split(ARRAY_ITEM_DELIMITER).length > 1 || v === EMPTY_ARRAY_IDENTIFIER)),
}

/** JavaScript 원시값을 URL parameter 값으로 변환 */
const encodeParam = <V>(value: V) => {
  if (isBoolean(value)) {
    return value === true ? TRUE : FALSE
  }
  if (value instanceof Date) {
    return dayjs(value).format(DATE_FULL_FORMAT)
  }
  /** 디코딩 시 배열의 길이가 1이라면 `string` 타입과 구별할 수 없으므로 두 타입을 구별하기 위해 항상 trailing comma 추가 */
  if (isArray(value)) {
    return value.length >= 1 ? `${value.join(ARRAY_ITEM_DELIMITER)}${ARRAY_ITEM_DELIMITER}` : EMPTY_ARRAY_IDENTIFIER
  }
  return `${value}`
}

export const toParams = <D extends Record<string, unknown>>(dict: D) => Object
  .entries(dict)
  .reduce((p, [k, v]) => is.empty(v) ? p : { ...p, [k]: encodeParam(v) }, {} as Record<string, string>)
