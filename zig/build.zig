const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const yuku_dep = b.dependency("yuku", .{
        .target = target,
        .optimize = optimize,
    });

    const yuku = yuku_dep.module("yuku");

    const yuku_exe = b.addExecutable(.{
        .name = "yuku",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/yuku.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });

    yuku_exe.root_module.addImport("yuku", yuku);

    b.installArtifact(yuku_exe);
}
