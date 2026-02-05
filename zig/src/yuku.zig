const std = @import("std");
const yuku = @import("yuku");

const js = yuku.js;

const cwd = std.Io.Dir.cwd();

pub fn main(init: std.process.Init) !void {
    const Io = init.io;
    const allocator = init.arena.allocator();

    const args = try init.minimal.args.toSlice(allocator);

    const path = args[1];
    const contents = try cwd.readFileAlloc(Io, path, allocator, std.Io.Limit.limited(10 * 1024 * 1024));

    const tree = try js.parse(std.heap.page_allocator, contents, .{
        .lang = js.Lang.fromPath(path),
        .source_type = js.SourceType.fromPath(path),
    });

    defer tree.deinit();
}
