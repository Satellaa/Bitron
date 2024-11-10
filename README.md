<h1 align="center">Bitron</h1>
<p align="center">
  <img src="/assets/Bitron-artwork.png" />
</p>
<p align="center">
  <strong>A command-line tool for validating YAML files and generating JSON output for the Monster Memory Tracker (MMT) application. It validates and compiles information about what effects/states monsters remember or forget after being temporarily banished or flipped face-down.</strong>
</p>

## Prerequisites

Before using Bitron, you need to:

1. Clone the monster-memory repository which contains the YAML files:
```bash
git clone https://github.com/your-username/monster-memory.git
```

2. Install Bitron either globally:
```bash
npm install -g bitron
```

Or locally in your project:
```bash
npm install bitron
```

## Usage

### Setup

1. First, ensure you have the monster-memory repository cloned and up to date:
```bash
cd monster-memory
git pull
```

2. The YAML files should be organized in the `cases` directory of the monster-memory repository. Bitron will look for this directory by default.

### Running Bitron

If installed globally:
```bash
# Basic validation using default cases directory from monster-memory repo
bitron
```

If installed locally:
```bash
# Using npx
npx bitron
```

### Command Line Parameters

| Parameter | Description | Default | Required |
|-----------|-------------|---------|----------|
| `--input-dir` | Path to the data directory in monster-memory repo | `./cases` | No |
| `--output-dir` | Directory where the JSON output will be saved | `./results` | No |
| `--no-output` | Skip JSON output generation | `false` | No |

## Configuration

The following environment variables can be used to configure Bitron:

| Environment Variable | Description | Default Value |
|---------------------|-------------|---------------|
| `BITRON_INPUT_PATH` | Default input directory path | `"cases"` |
| `BITRON_OUTPUT_PATH` | Default output file name | `"results"` |
