/**
 * 조건 C가 true일 경우 타입 T를, false일 경우 타입 F를 반환하는 타입 `If`를 구현하세요.
 *
 * 조건:
 * - C는 `true` 또는 `false`인 boolean literal 타입입니다.
 * - T, F는 임의의 타입일 수 있습니다.
 * - 조건 C에 따라 T 또는 F 중 하나의 타입만 반환되어야 합니다.
 *
 * 예시:
 * type A = If<true, 'a', 'b'>  // 결과: 'a'
 * type B = If<false, 'a', 'b'> // 결과: 'b'
 */

//true면 첫번째값 반환, false면 두번째값반환
type If<TorF extends boolean, T, F> = TorF extends true ? T : F;
