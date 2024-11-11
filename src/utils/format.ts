import * as t from 'io-ts';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import {
  ParseError,
  ParseErrorDetail,
  ParseErrors,
} from './errors';
import {
  MEMORY_STATUS_VALUES,
  MemoryStatus,
  NonEmptyString,
  ValidUrl,
} from './types';

export const formatParseError = (
  error: t.ValidationError
): ParseErrorDetail => {
  const path = error.context
    .map((c) => c.key)
    .filter((key): key is string => Boolean(key));
  const lastContext = error.context[error.context.length - 1];

  return {
    path,
    value: error.value,
    message: pipe(
      O.fromNullable(lastContext?.type.decode(error.value)),
      O.chain(
        (result): O.Option<string> =>
          E.fold<ParseErrors, unknown, O.Option<string>>(
            (errors) => {
              const firstError = errors[0];
              return firstError && firstError.message
                ? O.some(firstError.message)
                : O.none;
            },
            () => O.none
          )(result)
      ),
      O.getOrElse((): string => {
        if (lastContext?.type === MemoryStatus) {
          return `must be one of: ${MEMORY_STATUS_VALUES.map((v) => `"${v}"`).join(', ')}`;
        }
        if (lastContext?.type === NonEmptyString) {
          return 'must not be empty';
        }
        if (lastContext?.type === ValidUrl) {
          return 'must be a valid URL';
        }
        return 'invalid value';
      })
    ),
  };
};
