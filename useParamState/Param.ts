// import dayjs from 'dayjs';

import { ARRAY_ITEM_DELIMITER, EMPTY_ARRAY_IDENTIFIER } from "./const";

const createArrayDecoder =
  <D = string>(select?: (v: string) => D) =>
  (value: string) => {
    if (value === EMPTY_ARRAY_IDENTIFIER) {
      return []; //
    }
    return value.split(ARRAY_ITEM_DELIMITER).reduce((a, v) => {
      if (is.empty(v)) {
        return a;
      }
      return [...a, (select ? select(v) : v) as D];
    }, [] as D[]);
  };
