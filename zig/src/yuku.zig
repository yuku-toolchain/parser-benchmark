const std = @import("std");
const yuku_parser = @import("yuku_parser");

const cwd = std.Io.Dir.cwd();

pub fn main(init: std.process.Init) !void {
    const Io = init.io;
    const allocator = init.arena.allocator();

    const args = try init.minimal.args.toSlice(allocator);

    const path = args[1];
    const contents = try cwd.readFileAlloc(Io, path, allocator, std.Io.Limit.limited(10 * 1024 * 1024));

    const tree = try yuku_parser.parse(std.heap.page_allocator, contents, .{
        .lang = yuku_parser.Lang.fromPath(path),
        .source_type = yuku_parser.SourceType.fromPath(path),
    });

    defer tree.deinit();
}
