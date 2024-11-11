#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'node:path';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as A from 'fp-ts/Array';
import { parseMonsterMemoryCases } from './modules/parser';
import { makeDir, writeOutput } from './utils/filesystem';

const DEFAULT_INPUT_PATH = process.env.BITRON_INPUT_PATH || './cases';
const DEFAULT_OUTPUT_PATH = process.env.BITRON_OUTPUT_PATH || './results';

const parseConfig = () => {
  const options = new Command()
    .option('--input-dir <path>', 'Input directory path')
    .option('--output-dir <path>', 'Output directory path')
    .option('--no-output', 'Only validate without generating output')
    .parse()
    .opts();

  return {
    inputDir: options.inputDir || DEFAULT_INPUT_PATH,
    outputDir: options.outputDir || DEFAULT_OUTPUT_PATH,
    shouldOutput: options.output !== false,
  };
};

const run = async () => {
  const config = parseConfig();

  const result = await pipe(
    TE.tryCatch(
      () => makeDir(config.inputDir),
      (error) => new Error(`Failed to create input directory: ${error}`)
    ),
    TE.chain(() => parseMonsterMemoryCases(config.inputDir)),
    TE.chain((data) =>
      !config.shouldOutput
        ? TE.right(undefined)
        : A.isEmpty(data)
          ? TE.left(new Error('No data to process'))
          : pipe(
              TE.tryCatch(
                () => makeDir(config.outputDir),
                (error) =>
                  new Error(`Failed to create output directory: ${error}`)
              ),
              TE.chain(() =>
                writeOutput(path.join(config.outputDir, 'api.json'), data)
              )
            )
    )
  )();

  if (E.isLeft(result)) {
    if (result.left.message === 'No data to process') {
      console.log('No data found to process');
      return;
    }
    console.error('Error:', result.left.message);
    process.exit(1);
  }

  console.log(
    config.shouldOutput
      ? 'Successfully generated JSON output'
      : 'Validation completed successfully'
  );
};

run();
