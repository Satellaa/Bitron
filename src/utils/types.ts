import * as t from 'io-ts';
import { createFieldRequirement } from './errors';

export const MEMORY_STATUS_VALUES = [
  'Remembered',
  'Forgotten',
  'Refer to ruling',
] as const;
export type MemoryStatusType = (typeof MEMORY_STATUS_VALUES)[number];

const isMemoryStatus = (u: unknown): u is MemoryStatusType => {
  return (
    typeof u === 'string' &&
    MEMORY_STATUS_VALUES.includes(u as MemoryStatusType)
  );
};

export const MemoryStatus = new t.Type<
  MemoryStatusType,
  MemoryStatusType,
  unknown
>(
  'Status',
  (u): u is MemoryStatusType => isMemoryStatus(u),
  (u, c) =>
    isMemoryStatus(u)
      ? t.success(u)
      : t.failure(
          u,
          c,
          createFieldRequirement(
            'Status',
            'must be one of the allowed values',
            MEMORY_STATUS_VALUES
          )
        ),
  t.identity
);

export const NonEmptyString = new t.Type<string, string, unknown>(
  'Text',
  (u): u is string => typeof u === 'string' && u.length > 0,
  (u, c) =>
    typeof u === 'string' && u.length > 0
      ? t.success(u)
      : t.failure(u, c, createFieldRequirement('Text', 'must not be empty')),
  t.identity
);

export const ValidUrl = new t.Type<string, string, unknown>(
  'URL',
  (u): u is string => {
    try {
      return typeof u === 'string' && Boolean(new URL(u));
    } catch {
      return false;
    }
  },
  (u, c) => {
    try {
      return typeof u === 'string' && u.length > 0 && Boolean(new URL(u))
        ? t.success(u)
        : t.failure(u, c, createFieldRequirement('URL', 'must be a valid URL'));
    } catch {
      return t.failure(
        u,
        c,
        createFieldRequirement('URL', 'must be a valid URL')
      );
    }
  },
  t.identity
);

export const Source = t.type({
  text: NonEmptyString,
  url: ValidUrl,
});

export const FAQ = t.type({
  question: NonEmptyString,
  answer: NonEmptyString,
  sources: t.array(Source),
});

export const YamlContent = t.type({
  temporaryBanished: MemoryStatus,
  flipFaceDown: MemoryStatus,
  temporaryBanishedFAQs: t.union([t.undefined, t.array(FAQ)]),
  flipFaceDownFAQs: t.union([t.undefined, t.array(FAQ)]),
});

export const AugmentedContent = t.interface({
  temporaryBanished: MemoryStatus,
  flipFaceDown: MemoryStatus,
  temporaryBanishedFAQs: t.array(FAQ),
  flipFaceDownFAQs: t.array(FAQ),
});

export const MonsterMemoryCase = t.intersection([
  t.type({
    id: t.number,
    info: NonEmptyString,
  }),
  AugmentedContent,
]);

export const MonsterMemoryCategory = t.type({
  name: NonEmptyString,
  items: t.array(MonsterMemoryCase),
});

export type MonsterMemoryCase = t.TypeOf<typeof MonsterMemoryCase>;
export type MonsterMemoryCategory = t.TypeOf<typeof MonsterMemoryCategory>;
