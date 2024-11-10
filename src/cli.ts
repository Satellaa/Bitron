#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'node:path';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { parseMonsterMemoryCases } from './modules/parser';
import { makeDir, writeOutput } from './utils/filesystem';

interface CLIOptions {
  inputDir?: string;
  outputDir?: string;
  output?: boolean;
}

const DEFAULT_INPUT_PATH = process.env.BITRON_INPUT_PATH || 'cases';
const DEFAULT_OUTPUT_PATH = process.env.BITRON_OUTPUT_PATH || 'results';

const run = async () => {
  const program = new Command();
  program
    .name('bitron')
    .description('Parse and validate monster memory info YAML files')
    .option('--input-dir <path>', 'Input directory path')
    .option('--output-dir <path>', 'Output directory path')
    .option('--no-output', 'Only validate without generating output')
    .parse();

  const options = program.opts<CLIOptions>();

  const inputDir = options.inputDir || DEFAULT_INPUT_PATH;
  await makeDir(inputDir);

  const result = await pipe(
    parseMonsterMemoryCases(inputDir),
    TE.chain((data) => {
      if (!options.output) {
        return TE.right(undefined);
      }

      const outputDir = options.outputDir || DEFAULT_OUTPUT_PATH;
      const outputPath = path.join(outputDir, 'api.json');

      return pipe(
        TE.tryCatch(
          () => makeDir(outputDir),
          (error) => new Error(`Failed to create output directory: ${error}`)
        ),
        TE.chain(() => writeOutput(outputPath, data))
      );
    })
  )();

  if (E.isLeft(result)) {
    console.error('Error:', result.left.message);
    process.exit(1);
  }

  if (options.output) {
    console.log('Successfully generated JSON output');
  } else {
    console.log('Validation completed successfully');
  }
};
run();
