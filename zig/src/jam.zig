const std = @import("std");
const jam = @import("jam");

const Parser = jam.Parser;

const cwd = std.Io.Dir.cwd();

pub fn main(init: std.process.Init) !void {
    const Io = init.io;
    const allocator = init.arena.allocator();

    const args = try init.minimal.args.toSlice(allocator);

    const path = args[1];
    const contents = try cwd.readFileAlloc(Io, path, allocator, std.Io.Limit.limited(10 * 1024 * 1024));

    var parser = try Parser.init(allocator, contents, .{ .source_type = .module });
    defer parser.deinit();

    var result = try parser.parse();
    defer result.deinit();
}
