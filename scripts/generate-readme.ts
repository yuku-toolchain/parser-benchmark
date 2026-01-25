import { readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const PARSERS = {
  yuku: {
    name: "Yuku",
    language: "Zig",
    description:
      "A high-performance & spec-compliant JavaScript/TypeScript compiler written in Zig.",
    url: "https://github.com/arshad-yaseen/yuku",
  },
  oxc: {
    name: "Oxc",
    language: "Rust",
    description:
      "A high-performance JavaScript and TypeScript parser written in Rust.",
    url: "https://github.com/oxc-project/oxc",
  },
  swc: {
    name: "SWC",
    language: "Rust",
    description:
      "An extensible Rust-based platform for compiling and bundling JavaScript and TypeScript.",
    url: "https://github.com/swc-project/swc",
  },
  jam: {
    name: "Jam",
    language: "Zig",
    description:
      "A JavaScript toolchain written in Zig featuring a parser, linter, formatter, printer, and vulnerability scanner.",
    url: "https://github.com/srijan-paul/jam",
  },
} as const;

const FILES = {
  typescript: {
    name: "TypeScript",
    description:
      "The TypeScript compiler source code bundled into a single file.",
    path: "files/typescript.js",
  },
  three: {
    name: "Three.js",
    description: "A popular 3D graphics library for the web.",
    path: "files/three.js",
  },
  antd: {
    name: "Ant Design",
    description:
      "A popular React UI component library with enterprise-class design.",
    path: "files/antd.js",
  },
} as const;

type ParserKey = keyof typeof PARSERS;
type FileKey = keyof typeof FILES;

interface BenchmarkResult {
  command: string;
  mean: number;
  stddev: number;
  median: number;
  min: number;
  max: number;
}

interface BenchmarkData {
  results: BenchmarkResult[];
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function formatTime(seconds: number): string {
  const ms = seconds * 1000;
  return `${ms.toFixed(2)} ms`;
}

function formatThroughput(bytes: number, seconds: number): string {
  const mbPerSec = bytes / (1024 * 1024) / seconds;
  return `${mbPerSec.toFixed(2)} MB/s`;
}

function extractParserName(command: string): string {
  const match = command.match(/\.\/bin\/(\w+)/);
  return match ? match[1] : "unknown";
}

async function getFileSize(filePath: string): Promise<number> {
  const stats = await stat(filePath);
  return stats.size;
}

async function readBenchmarkResults(fileKey: FileKey): Promise<BenchmarkData> {
  const resultPath = join(process.cwd(), "result", `${fileKey}.json`);
  const content = await readFile(resultPath, "utf-8");
  return JSON.parse(content);
}

function generateParsersSection(): string {
  const lines = ["## Parsers", ""];

  for (const [key, parser] of Object.entries(PARSERS)) {
    lines.push(`### [${parser.name}](${parser.url})`);
    lines.push("");
    lines.push(`**Language:** ${parser.language}`);
    lines.push("");
    lines.push(parser.description);
    lines.push("");
  }

  return lines.join("\n");
}

async function generateBenchmarkTable(
  fileKey: FileKey,
  fileSize: number
): Promise<string> {
  const data = await readBenchmarkResults(fileKey);
  const lines: string[] = [];

  const sortedResults = [...data.results].sort((a, b) => a.mean - b.mean);

  lines.push("| Parser | Mean | Min | Max | MB/s |");
  lines.push("|--------|------|-----|-----|------|");

  for (const result of sortedResults) {
    const parserKey = extractParserName(result.command) as ParserKey;
    const parser = PARSERS[parserKey];
    if (!parser) continue;

    const throughput = formatThroughput(fileSize, result.mean);

    lines.push(
      `| ${parser.name} | ${formatTime(result.mean)} | ${formatTime(result.min)} | ${formatTime(result.max)} | ${throughput} |`
    );
  }

  return lines.join("\n");
}

async function generateBenchmarksSection(): Promise<string> {
  const lines = ["## Benchmarks", ""];

  for (const [key, file] of Object.entries(FILES)) {
    const fileKey = key as FileKey;
    const filePath = join(process.cwd(), file.path);
    const fileSize = await getFileSize(filePath);

    lines.push(`### ${file.name}`);
    lines.push("");
    lines.push(`${file.description}`);
    lines.push("");
    lines.push(`**File size:** ${formatBytes(fileSize)}`);
    lines.push("");

    const table = await generateBenchmarkTable(fileKey, fileSize);
    lines.push(table);
    lines.push("");
  }

  return lines.join("\n");
}

function generateRunSection(): string {
  return `## Run Benchmarks

### Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [Rust](https://www.rust-lang.org/tools/install) - For building Rust-based parsers
- [Zig](https://ziglang.org/download/) - For building Zig-based parsers
- [Hyperfine](https://github.com/sharkdp/hyperfine) - Command-line benchmarking tool

### Steps

1. Clone the repository:

\`\`\`bash
git clone https://github.com/arshad-yaseen/ecmascript-native-parser-benchmark.git
cd ecmascript-native-parser-benchmark
\`\`\`

2. Install dependencies:

\`\`\`bash
bun install
\`\`\`

3. Run benchmarks:

\`\`\`bash
bun bench
\`\`\`

This will build all parsers and run benchmarks on all test files. Results are saved to the \`result/\` directory.`;
}

function generateMethodologySection(): string {
  return `## Methodology

### How Benchmarks Are Conducted

1. **Build Phase**: All parsers are compiled with release optimizations:
   - Rust parsers: \`cargo build --release\` with LTO, single codegen unit, and symbol stripping
   - Zig parsers: \`zig build --release=fast\`

2. **Benchmark Phase**: Each parser is benchmarked using [Hyperfine](https://github.com/sharkdp/hyperfine):
   - 100 warmup runs to ensure stable measurements
   - Multiple timed runs for statistical accuracy
   - Results exported to JSON for analysis

3. **Measurement**: Each benchmark measures the total time to:
   - Read the source file from disk
   - Parse the entire file into an AST
   - Clean up allocated memory

### Test Files

The benchmark uses real-world JavaScript files from popular open-source projects to ensure results reflect practical performance characteristics.`;
}

async function generateReadme(): Promise<string> {
  const lines = [
    "# ECMAScript Native Parser Benchmark",
    "",
    "Benchmark ECMAScript parsers implemented in native languages.",
    "",
    generateParsersSection(),
    await generateBenchmarksSection(),
    generateRunSection(),
    "",
    generateMethodologySection(),
  ];

  return lines.join("\n");
}

async function main() {
  const readme = await generateReadme();
  await writeFile(join(process.cwd(), "README.md"), readme);
  console.log("README.md generated successfully!");
}

main().catch(console.error);
