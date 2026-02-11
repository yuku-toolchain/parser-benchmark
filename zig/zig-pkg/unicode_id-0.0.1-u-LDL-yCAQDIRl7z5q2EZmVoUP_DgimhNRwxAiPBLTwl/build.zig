const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const module = b.addModule("unicode-id", .{
        .root_source_file = b.path("src/root.zig"),
        .target = target,
        .optimize = optimize,
    });

    const lib = b.addLibrary(.{
        .linkage = .static,
        .name = "unicode-id",
        .root_module = module,
    });
    b.installArtifact(lib);

    const lib_unit_tests = b.addTest(.{
        .root_module = module,
    });

    const run_lib_unit_tests = b.addRunArtifact(lib_unit_tests);

    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_lib_unit_tests.step);

    const benchmark = b.addExecutable(.{
        .name = "benchmark",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/benchmark.zig"),
            .target = b.graph.host,
            .optimize = b.standardOptimizeOption(.{
                .preferred_optimize_mode = std.builtin.OptimizeMode.ReleaseFast,
            }),
        }),
    });
    const run_benchmark = b.addRunArtifact(benchmark);
    const bench_step = b.step("bench", "Run benchmark");
    bench_step.dependOn(&run_benchmark.step);
}
