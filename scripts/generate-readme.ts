import { readFile, writeFile, stat, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { cpus, totalmem, platform, arch, release } from "node:os";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import type { ChartConfiguration } from "chart.js";

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

const CHART_COLORS = {
  yuku: "#FF6B35",
  oxc: "#F72585",
  swc: "#4CC9F0",
  jam: "#7209B7",
};

async function generatePerformanceChart(fileKey: FileKey): Promise<string> {
  const data = await readBenchmarkResults(fileKey);
  const chartWidth = 800;
  const chartHeight = 400;

  const resultsByParser = new Map<ParserKey, BenchmarkResult>();
  for (const result of data.results) {
    const parserKey = extractParserName(result.command) as ParserKey;
    if (PARSERS[parserKey]) {
      resultsByParser.set(parserKey, result);
    }
  }

  const parserData: Array<{
    name: string;
    mean: number;
    color: string;
  }> = [];

  for (const [key, parser] of Object.entries(PARSERS)) {
    const parserKey = key as ParserKey;
    const result = resultsByParser.get(parserKey);
    if (result) {
      parserData.push({
        name: parser.name,
        mean: result.mean * 1000,
        color: CHART_COLORS[parserKey],
      });
    }
  }

  parserData.sort((a, b) => a.mean - b.mean);

  const labels = parserData.map((p) => p.name);
  const meanData = parserData.map((p) => p.mean);
  const colors = parserData.map((p) => p.color);

  const maxTime = Math.max(...meanData);
  const chartMax = maxTime < 200 ? 200 : maxTime < 500 ? 500 : 1000;

  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: chartWidth,
    height: chartHeight,
    backgroundColour: "#0d1117",
  });

  const configuration: ChartConfiguration = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Time (ms)",
          data: meanData,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 0,
          borderRadius: 6,
          barThickness: 40,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: false,
      plugins: {
        title: {
          display: false,
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: chartMax,
          grid: {
            color: "#21262d",
            lineWidth: 1,
          },
          ticks: {
            color: "#8b949e",
            font: {
              size: 12,
            },
            callback: function (value) {
              return value + " ms";
            },
          },
          title: {
            display: true,
            text: "Parse Time",
            font: {
              size: 14,
              weight: "bold",
            },
            color: "#8b949e",
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#e6edf3",
            font: {
              size: 14,
              weight: 500,
            },
          },
        },
      },
    },
  };

  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  const chartPath = join(process.cwd(), "charts", `${fileKey}.png`);
  await mkdir(join(process.cwd(), "charts"), { recursive: true });
  await writeFile(chartPath, imageBuffer);

  return `charts/${fileKey}.png`;
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

  const resultsByParser = new Map<ParserKey, BenchmarkResult>();
  for (const result of data.results) {
    const parserKey = extractParserName(result.command) as ParserKey;
    if (PARSERS[parserKey]) {
      resultsByParser.set(parserKey, result);
    }
  }

  const parserEntries: Array<{
    parser: typeof PARSERS[ParserKey];
    result: BenchmarkResult | null;
  }> = [];

  for (const [key, parser] of Object.entries(PARSERS)) {
    const parserKey = key as ParserKey;
    const result = resultsByParser.get(parserKey) || null;
    parserEntries.push({ parser, result });
  }

  parserEntries.sort((a, b) => {
    if (a.result && b.result) {
      return a.result.mean - b.result.mean;
    }
    if (a.result && !b.result) return -1;
    if (!a.result && b.result) return 1;
    return 0;
  });

  lines.push("| Parser | Mean | Min | Max |");
  lines.push("|--------|------|-----|-----|");

  for (const { parser, result } of parserEntries) {
    if (result) {
      lines.push(
        `| ${parser.name} | ${formatTime(result.mean)} | ${formatTime(result.min)} | ${formatTime(result.max)} |`
      );
    } else {
      lines.push(
        `| ${parser.name} | Failed to parse | - | - |`
      );
    }
  }

  return lines.join("\n");
}

async function generateBenchmarksSection(): Promise<string> {
  const lines = ["## Benchmarks", ""];

  for (const [key, file] of Object.entries(FILES)) {
    const fileKey = key as FileKey;
    const filePath = join(process.cwd(), file.path);
    const fileSize = await getFileSize(filePath);
    
    const githubUrl = `https://github.com/arshad-yaseen/ecmascript-native-parser-benchmark/blob/main/${file.path}`;

    lines.push(`### [${file.name}](${githubUrl})`);
    lines.push("");
    lines.push(`${file.description}`);
    lines.push("");
    lines.push(`**File size:** ${formatBytes(fileSize)}`);
    lines.push("");

    const chartPath = await generatePerformanceChart(fileKey);
    lines.push(`![${file.name} Performance](${chartPath})`);
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
- [Zig](https://ziglang.org/download/) - For building Zig-based parsers (requires nightly/development version)
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

function getSystemInfo(): string {
  const cpu = cpus()[0];
  const cpuModel = cpu?.model || "Unknown CPU";
  const cpuCores = cpus().length;
  const totalMemoryGB = (totalmem() / (1024 * 1024 * 1024)).toFixed(0);
  const os = platform();
  const osArch = arch();
  const osRelease = release();

  const osName =
    os === "darwin" ? "macOS" : os === "win32" ? "Windows" : os === "linux" ? "Linux" : os;

  return `## System

| Property | Value |
|----------|-------|
| OS | ${osName} ${osRelease} (${osArch}) |
| CPU | ${cpuModel} |
| Cores | ${cpuCores} |
| Memory | ${totalMemoryGB} GB |`;
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
    getSystemInfo(),
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
