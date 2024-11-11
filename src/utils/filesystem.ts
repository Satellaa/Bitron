import * as fs from 'node:fs';
import * as path from 'node:path';
import * as TE from 'fp-ts/TaskEither';

export const readDir = (dirPath: string): TE.TaskEither<Error, fs.Dirent[]> =>
  TE.tryCatch(
    () => fs.promises.readdir(dirPath, { withFileTypes: true }),
    (error) => new Error(`Failed to read directory ${dirPath}: ${error}`)
  );

export const readFile = (filePath: string): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    () => fs.promises.readFile(filePath, 'utf8'),
    (error) => new Error(`Failed to read file ${filePath}: ${error}`)
  );

export const writeOutput = (
  outputPath: string,
  data: unknown
): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    () =>
      fs.promises.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8'),
    (error) => new Error(`Failed to write output to ${outputPath}: ${error}`)
  );

export const makeDir = async (dirPath: string): Promise<void> => {
  try {
    await fs.promises.access(dirPath);
  } catch {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
};

export const isYmlFile = (file: fs.Dirent): boolean =>
  file.isFile() && file.name.endsWith('.yml');

export const isDirectory = (file: fs.Dirent): boolean => file.isDirectory();

export const getFileNameWithoutExt = (filePath: string): string =>
  path
    .basename(filePath, '.yml')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
