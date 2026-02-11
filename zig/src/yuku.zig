const std = @import("std");
const yuku_parser = @import("yuku_parser");

const source = @embedFile("source");

pub fn main(_: std.process.Init) !void {
    const tree = try yuku_parser.parse(std.heap.page_allocator, source, .{
        .lang = yuku_parser.Lang.fromPath("bench.js"),
        .source_type = yuku_parser.SourceType.fromPath("bench.js"),
    });
    defer tree.deinit();
}
