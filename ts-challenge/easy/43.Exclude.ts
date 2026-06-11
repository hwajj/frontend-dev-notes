//T에서 U에 할당할 수 있는 타입을 제외하는 내장 제네릭 Exclude<T, U>를 이를 사용하지 않고 구현하세요.

type Result = MyExclude<"a" | "b" | "c", "a">; // 'b' | 'c'

type MyExclude<T, U> = T extends U ? never : T;

/**
 *
 * // 분해
 * = ("a" extends "a" ? never : "a")
 * | ("b" extends "a" ? never : "b")
 * | ("c" extends "a" ? never : "c")
 * // 정리
 * = never | "b" | "c"
 * = "b" | "c"
 */
