# ECMAScript Native Parser Benchmark

Benchmark ECMAScript parsers implemented in native languages.

## System

| Property | Value |
|----------|-------|
| OS | macOS 24.6.0 (arm64) |
| CPU | Apple M1 (Virtual) |
| Cores | 3 |
| Memory | 7 GB |

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

### TypeScript

The TypeScript compiler source code bundled into a single file.

**File size:** 7.83 MB

| Parser | Mean | Min | Max | MB/s |
|--------|------|-----|-----|------|
| Yuku | 26.88 ms | 25.47 ms | 31.96 ms | 291.16 MB/s |
| Oxc | 28.00 ms | 25.48 ms | 44.84 ms | 279.59 MB/s |
| SWC | 67.56 ms | 60.37 ms | 104.01 ms | 115.85 MB/s |
| Jam | 89.46 ms | 69.45 ms | 117.06 ms | 87.49 MB/s |

### Three.js

A popular 3D graphics library for the web.

**File size:** 1.96 MB

| Parser | Mean | Min | Max | MB/s |
|--------|------|-----|-----|------|
| Jam | 9.98 ms | 9.56 ms | 11.67 ms | 196.61 MB/s |
| Oxc | 11.68 ms | 4.35 ms | 83.83 ms | 168.11 MB/s |
| Yuku | 13.90 ms | 4.29 ms | 85.65 ms | 141.22 MB/s |
| SWC | 15.78 ms | 10.94 ms | 56.51 ms | 124.41 MB/s |

### Ant Design

A popular React UI component library with enterprise-class design.

**File size:** 5.43 MB

| Parser | Mean | Min | Max | MB/s |
|--------|------|-----|-----|------|
| Yuku | 31.47 ms | 30.42 ms | 39.21 ms | 172.51 MB/s |
| Oxc | 33.85 ms | 32.67 ms | 40.05 ms | 160.37 MB/s |
| SWC | 59.65 ms | 56.44 ms | 70.72 ms | 91.01 MB/s |

## Run Benchmarks

### Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [Rust](https://www.rust-lang.org/tools/install) - For building Rust-based parsers
- [Zig](https://ziglang.org/download/) - For building Zig-based parsers
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