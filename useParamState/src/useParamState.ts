import { useSearchParams } from 'react-router-dom'

import { isFunction, isIn, isPlainObject, isString } from '../../utils/type/typeCheck'
import { toParams } from './utils'
import { ParamConfigs, PayloadWithNull } from './types'

/**
 * @param initialValue 파라미터들의 기본값.
 * @param validators `initialValue`로 설정한 파라미터 값의 유효성 검사를 위한 설정. 
 */
export const useParamState = <V extends Record<string, unknown>>(configs: ParamConfigs<V>) => {
  const [params, setParams] = useSearchParams()

  function getParam<K extends keyof V>(key: K) {
    const { value, decoder, validator } = configs[key]

    const raw = params.get(key as string)
    const isValid = isFunction(validator) ? validator(raw) : true
    const fallbackValue = value

    /** 값이 없을 때 */
    if (!raw) {
      return fallbackValue
    }
    /** 유효하지 않은 값일 때 */
    if (raw && !isValid) {
      return fallbackValue
    }
    return decoder(raw)
  }

  async function updateParam<K extends keyof V>(key: K, value: PayloadWithNull<V[K]>): Promise<void>
  async function updateParam(entries: PayloadWithNull<V>): Promise<void>
  async function updateParam(empty: null): Promise<void>

  async function updateParam<K extends keyof V>(key: K | PayloadWithNull<V> | null, value?: PayloadWithNull<V[K]>) {
    if (isString(key) && value !== undefined) {
      setParams((p) => toParams({ ...Object.fromEntries(p.entries()), [key]: value }), { replace: true })
    } else if (isPlainObject(key)) {
      setParams((p) => toParams({ ...Object.fromEntries(p.entries()), ...key }), { replace: true })
    } else {
      setParams('', { replace: true })
    }
    /** `setParams()`은 batch update되지 않기 때문에 인위적으로 await 처리 */
    await new Promise((r) => setTimeout(r, 50))
  }

  const getAllParams = (callback: (prev: V, key: keyof V, value: V[keyof V]) => V) => Object
    .keys(configs)
    .reduce((a, k) => callback(a, k, getParam(k)), {} as V)

  const getNonEmptyParams = () => getAllParams((prev, k, v) => isIn([null, undefined], v) ? prev : { ...prev, [k]: v })

  const getInitialParams = () => getAllParams((prev, k) => ({ ...prev, [k]: configs[k].value }))

  const paramUtils = {
    get: getParam,
    all: getNonEmptyParams,
    raw: () => params.toString(),
    toInitial: getInitialParams,
    /** 사용자가 URL parameter를 변경했는지 여부를 확인. */
    isDirty: () => !!params.toString(),
  }

  return [paramUtils, updateParam] as const
}
