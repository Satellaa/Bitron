import * as t from 'io-ts';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import * as yaml from 'js-yaml';
import { pipe } from 'fp-ts/function';
import { ParseError } from '../utils/errors';
import { formatParseError } from '../utils/format';
import {
  YamlContent,
  MonsterMemoryCategory,
  MonsterMemoryCase,
} from '../utils/types';
import {
  readDir,
  readFile,
  isYmlFile,
  isDirectory,
  getFileNameWithoutExt,
} from '../utils/filesystem';

const parseYaml = (
  filePath: string,
  content: string
): E.Either<Error, unknown> =>
  E.tryCatch(
    () => yaml.load(content),
    (error) => new Error(`Failed to parse YAML in ${filePath}: ${error}`)
  );

const parseYamlContent = (
  filePath: string,
  data: unknown
): E.Either<Error, t.TypeOf<typeof YamlContent>> =>
  pipe(
    YamlContent.decode(data),
    E.mapLeft(
      (errors) => new ParseError(filePath, errors.map(formatParseError))
    )
  );

const parseCategory = (
  categoryPath: string,
  category: unknown
): E.Either<Error, MonsterMemoryCategory> =>
  pipe(
    MonsterMemoryCategory.decode(category),
    E.mapLeft(
      (errors) => new ParseError(categoryPath, errors.map(formatParseError))
    )
  );

const augmentContent = (content: t.TypeOf<typeof YamlContent>) => ({
  ...content,
  temporaryBanishedFAQs: content.temporaryBanishedFAQs ?? [],
  flipFaceDownFAQs: content.flipFaceDownFAQs ?? [],
});

const processYamlFile = (
  filePath: string,
  id: number
): TE.TaskEither<Error, MonsterMemoryCase> => {
  const info = getFileNameWithoutExt(filePath);

  return pipe(
    readFile(filePath),
    TE.chain((content) => TE.fromEither(parseYaml(filePath, content))),
    TE.chain((data) => TE.fromEither(parseYamlContent(filePath, data))),
    TE.map((content) => ({
      id,
      info,
      ...augmentContent(content),
    }))
  );
};

const processMemoryCategory = (
  basePath: string,
  dir: fs.Dirent,
  startId: number
): TE.TaskEither<Error, MonsterMemoryCategory> => {
  const categoryPath = path.join(basePath, dir.name);
  const categoryName = getFileNameWithoutExt(dir.name);

  return pipe(
    readDir(categoryPath),
    TE.chain((files) =>
      pipe(
        files.filter(isYmlFile),
        A.mapWithIndex((index, file) =>
          processYamlFile(path.join(categoryPath, file.name), startId + index)
        ),
        A.sequence(TE.ApplicativePar)
      )
    ),
    TE.map((items) => ({
      name: categoryName,
      items,
    })),
    TE.chain((category) => TE.fromEither(parseCategory(categoryPath, category)))
  );
};

export const parseMonsterMemoryCases = (
  basePath: string
): TE.TaskEither<Error, MonsterMemoryCategory[]> =>
  pipe(
    readDir(basePath),
    TE.chain((dirs) =>
      pipe(
        dirs.filter(isDirectory),
        A.mapWithIndex((index, dir) =>
          processMemoryCategory(basePath, dir, index * 100 + 1)
        ),
        A.sequence(TE.ApplicativePar)
      )
    )
  );
