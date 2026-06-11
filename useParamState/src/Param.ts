import dayjs from 'dayjs'
import { Decoder, ParamConfig, RecordParamConfig } from './types'
import { is, isValid } from './utils'
import { ARRAY_ITEM_DELIMITER, EMPTY_ARRAY_IDENTIFIER, TRUE } from './const';

const createArrayDecoder = <D = string>(select?: (v: string) => D) => (value: string) => {
  if (value === EMPTY_ARRAY_IDENTIFIER) {
    return [];
  }
  return value
    .split(ARRAY_ITEM_DELIMITER)
    .reduce((a, v) => {
      if (is.empty(v)) {
        return a;
      }
      return [...a, (select ? select(v) : v) as D];
    }, [] as D[]);
}

const createRecordDecoder = <R extends Record<string, string>>(record: R) => {
  const map = new Map(Object.values(record).map((v) => [`${v}`, v]))

  return (value: string) => map.get(value) ?? null
}

export class Param {
  static boolean(initialValue: boolean): ParamConfig<boolean>
  static boolean(): ParamConfig<boolean | null>

  static boolean(initialValue?: boolean): ParamConfig<boolean | null> {
    return {
      value: initialValue ?? null,
      decoder: (value: string) => value === TRUE,
      validator: isValid.boolean,
    }
  }

  static number(initialValue: number): ParamConfig<number>
  static number(): ParamConfig<number | null>

  static number(initialValue?: number): ParamConfig<number | null> {
    return {
      value: initialValue ?? null,
      decoder: Number,
      validator: isValid.number,
    }
  }

  static string(initialValue = '') {
    return {
      value: initialValue,
      decoder: (value: string) => value,
    }
  }
  static date(initialValue: Date): ParamConfig<Date>
  static date(): ParamConfig<Date | null>

  static date(initialValue?: Date): ParamConfig<Date | null> {
    return {
      value: initialValue ?? null,
      decoder: (value: string) => dayjs(value).toDate(),
      validator: isValid.date,
    }
  }

  /** `string[]`이 아닌 배열은 지원하지 않음 */
  static array<D>(initialValue = [] as D[]) {
    return {
      value: initialValue,
      decoder: createArrayDecoder(),
      validator: isValid.array,
    }
  }

  static tuple<R extends Record<string, string>>(record: R, initialValue = [] as R[keyof R][]) {
    return {
      value: initialValue,
      /** `validator`를 통해 유효하지 않은 값은 사전에 제거되므로 타입 단언 사용 */
      decoder: createArrayDecoder(createRecordDecoder(record)) as Decoder<R[keyof R][]>,
      validator: isValid.tuple(record),
    }
  }

  static record<R extends Record<string, string>>(record: R, initialValue: R[keyof R]): RecordParamConfig<R[keyof R]>
  static record<R extends Record<string, string>>(record: R): RecordParamConfig<R[keyof R] | null>

  static record<R extends Record<string, string>>(record: R, initialValue?: R[keyof R] | null) {
    return {
      value: initialValue ?? null,
      decoder: createRecordDecoder(record),
      validator: isValid.record(record),
      fromEvent: (value: string) => ['', null].includes(value) ? null : value as R[keyof R],
    }
  }
}