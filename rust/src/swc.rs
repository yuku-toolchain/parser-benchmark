#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use std::{env, fs, path::Path};

use swc_common::BytePos;
use swc_ecma_parser::{EsSyntax, Parser, StringInput, Syntax, TsSyntax};

fn main() {
    let path = env::args().nth(1).unwrap();
    let path = Path::new(&path);
    let source_text = fs::read_to_string(path).unwrap();

    let syntax = match path.extension().unwrap().to_str().unwrap() {
        "js" => Syntax::Es(EsSyntax::default()),
        "tsx" => Syntax::Typescript(TsSyntax {
            tsx: true,
            ..TsSyntax::default()
        }),
        _ => Syntax::Es(EsSyntax::default()),
    };
    let input = StringInput::new(&source_text, BytePos(0), BytePos(source_text.len() as u32));
    let _ = Parser::new(syntax, input, None).parse_module().unwrap();
}
