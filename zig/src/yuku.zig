const std = @import("std");
const yuku = @import("yuku");

const js = yuku.js;

pub fn main() !void {
    var gpa = std.heap.DebugAllocator(.{}).init;
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    const path = args[1];
    const file = try std.fs.cwd().openFile(path, .{});
    defer file.close();

    var buffer: [4096]u8 = undefined;
    var reader = file.reader(&buffer);
    const contents = try reader.interface.allocRemaining(allocator, std.Io.Limit.limited(10 * 1024 * 1024));
    defer allocator.free(contents);

    const tree = try js.parse(std.heap.page_allocator, contents, .{
        .lang = js.Lang.fromPath(path),
        .source_type = js.SourceType.fromPath(path),
    });

    defer tree.deinit();
}
