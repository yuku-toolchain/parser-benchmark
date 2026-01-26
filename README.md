# ECMAScript Native Parser Benchmark

Benchmark ECMAScript parsers implemented in native languages.

## System

| Property | Value |
|----------|-------|
| OS | macOS 24.5.0 (arm64) |
| CPU | Apple M3 |
| Cores | 8 |
| Memory | 16 GB |

## Parsers

### [Yuku](https://github.com/arshad-yaseen/yuku)

**Language:** Zig

A high-performance & spec-compliant JavaScript/TypeScript compiler written in Zig.

### [Oxc](https://github.com/oxc-project/oxc)

**Language:** Rust

A high-performance JavaScript and TypeScript parser written in Rust.

### [SWC](https://github.com/swc-project/swc)

**Language:** Rust

An extensible Rust-based platform for compiling and bundling JavaScript and TypeScript.

### [Jam](https://github.com/srijan-paul/jam)

**Language:** Zig

A JavaScript toolchain written in Zig featuring a parser, linter, formatter, printer, and vulnerability scanner.

## Benchmarks

### [TypeScript](https://github.com/arshad-yaseen/ecmascript-native-parser-benchmark/blob/main/files/typescript.js)

The TypeScript compiler source code bundled into a single file.

**File size:** 7.83 MB

![TypeScript Performance](charts/typescript.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Oxc | 68.85 ms | 68.23 ms | 71.46 ms |
| Yuku | 70.79 ms | 70.31 ms | 75.03 ms |
| SWC | 141.51 ms | 138.63 ms | 145.66 ms |
| Jam | 159.99 ms | 157.80 ms | 161.27 ms |

### [Three.js](https://github.com/arshad-yaseen/ecmascript-native-parser-benchmark/blob/main/files/three.js)

A popular 3D graphics library for the web.

**File size:** 1.96 MB

![Three.js Performance](charts/three.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Oxc | 15.22 ms | 14.70 ms | 16.26 ms |
| Yuku | 16.78 ms | 16.11 ms | 18.28 ms |
| SWC | 29.22 ms | 28.16 ms | 30.84 ms |
| Jam | 35.60 ms | 34.90 ms | 36.54 ms |

### [Ant Design](https://github.com/arshad-yaseen/ecmascript-native-parser-benchmark/blob/main/files/antd.js)

A popular React UI component library with enterprise-class design.

**File size:** 5.43 MB

![Ant Design Performance](charts/antd.png)

| Parser | Mean | Min | Max |
|--------|------|-----|-----|
| Yuku | 54.73 ms | 54.03 ms | 56.38 ms |
| Oxc | 55.19 ms | 54.59 ms | 56.25 ms |
| SWC | 106.76 ms | 105.86 ms | 107.85 ms |
| Jam | Failed to parse | - | - |

## Run Benchmarks

### Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [Rust](https://www.rust-lang.org/tools/install) - For building Rust-based parsers
- [Zig](https://ziglang.org/download/) - For building Zig-based parsers (requires nightly/development version)
- [Hyperfine](https://github.com/sharkdp/hyperfine) - Command-line benchmarking tool

### Steps

1. Clone the repository:

```bash
git clone https://github.com/arshad-yaseen/ecmascript-native-parser-benchmark.git
cd ecmascript-native-parser-benchmark
```

2. Install dependencies:

```bash
bun install
```

3. Run benchmarks:

```bash
bun bench
```

This will build all parsers and run benchmarks on all test files. Results are saved to the `result/` directory.

## Methodology

### How Benchmarks Are Conducted

1. **Build Phase**: All parsers are compiled with release optimizations:
   - Rust parsers: `cargo build --release` with LTO, single codegen unit, and symbol stripping
   - Zig parsers: `zig build --release=fast`

2. **Benchmark Phase**: Each parser is benchmarked using [Hyperfine](https://github.com/sharkdp/hyperfine):
   - 100 warmup runs to ensure stable measurements
   - Multiple timed runs for statistical accuracy
   - Results exported to JSON for analysis

3. **Measurement**: Each benchmark measures the total time to:
   - Read the source file from disk
   - Parse the entire file into an AST
   - Clean up allocated memory

### Test Files

The benchmark uses real-world JavaScript files from popular open-source projects to ensure results reflect practical performance characteristics.