import * as t from 'io-ts';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import {
  ValidationError,
  ValidationErrorDetail,
  ValidationErrors,
} from '../utils/errors';
import {
  YamlContent,
  MonsterMemoryCategory,
  MemoryStatus,
  NonEmptyString,
  ValidUrl,
  MEMORY_STATUS_VALUES,
} from '../utils/types';

export const formatValidationError = (
  error: t.ValidationError
): ValidationErrorDetail => {
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
          E.fold<ValidationErrors, unknown, O.Option<string>>(
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

export const validateYamlContent = (
  filePath: string,
  data: unknown
): E.Either<Error, t.TypeOf<typeof YamlContent>> =>
  pipe(
    YamlContent.decode(data),
    E.mapLeft(
      (errors) =>
        new ValidationError(filePath, errors.map(formatValidationError))
    )
  );

export const validateCategory = (
  categoryPath: string,
  category: unknown
): E.Either<Error, MonsterMemoryCategory> =>
  pipe(
    MonsterMemoryCategory.decode(category),
    E.mapLeft(
      (errors) =>
        new ValidationError(categoryPath, errors.map(formatValidationError))
    )
  );
