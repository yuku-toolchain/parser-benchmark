# ECMAScript Native Parser Benchmark

Benchmark ECMAScript parsers implemented in native languages.

## Parsers

### [Yuku](https://github.com/arshad-yaseen/yuku)

**Language:** Zig

A high-performance JavaScript/TypeScript compiler written in Zig, featuring a fast parser, visitor/traverser, and transpiler. Full ECMAScript spec compliance, passes all Test262 parser tests.

### [Oxc](https://github.com/oxc-project/oxc)

**Language:** Rust

A high-performance JavaScript and TypeScript parser written in Rust. 3x faster than swc parser with full support for the latest ECMAScript syntax, TypeScript, JSX/TSX, and Stage 3 Decorators.

### [SWC](https://github.com/swc-project/swc)

**Language:** Rust

An extensible Rust-based platform for compiling and bundling JavaScript and TypeScript. Used by Next.js, Parcel, Deno, Vercel, and more. 20x faster than Babel on a single thread.

### [Jam](https://github.com/srijan-paul/jam)

**Language:** Zig

A JavaScript toolchain written in Zig featuring a parser, linter, formatter, printer, and vulnerability scanner. Supports JS, JSX, and TypeScript out of the box.

## Benchmarks

### TypeScript

The TypeScript compiler source code bundled into a single file.

**File size:** 7.83 MB

| Parser | Mean | Min | Max | MB/s |
|--------|------|-----|-----|------|
| Oxc | 29.57 ms | 28.99 ms | 29.95 ms | 264.72 MB/s |
| Yuku | 31.86 ms | 31.15 ms | 32.34 ms | 245.64 MB/s |
| SWC | 58.22 ms | 57.55 ms | 61.40 ms | 134.45 MB/s |
| Jam | 66.45 ms | 65.58 ms | 67.38 ms | 117.79 MB/s |

### Three.js

A popular 3D graphics library for the web.

**File size:** 1.96 MB

| Parser | Mean | Min | Max | MB/s |
|--------|------|-----|-----|------|
| Oxc | 7.68 ms | 7.32 ms | 10.60 ms | 255.69 MB/s |
| Yuku | 8.44 ms | 8.11 ms | 8.96 ms | 232.58 MB/s |
| SWC | 13.56 ms | 13.12 ms | 14.61 ms | 144.76 MB/s |
| Jam | 14.32 ms | 13.92 ms | 14.97 ms | 137.07 MB/s |

### Ant Design

A popular React UI component library with enterprise-class design.

**File size:** 5.43 MB

| Parser | Mean | Min | Max | MB/s |
|--------|------|-----|-----|------|
| Yuku | 24.19 ms | 23.78 ms | 32.51 ms | 224.38 MB/s |
| Oxc | 24.38 ms | 23.98 ms | 24.90 ms | 222.65 MB/s |
| SWC | 45.03 ms | 44.33 ms | 45.63 ms | 120.56 MB/s |

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
