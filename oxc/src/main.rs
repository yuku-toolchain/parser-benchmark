use std::fs;

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

fn main() {
    let path = std::env::args().nth(1).unwrap();
    let source_text = fs::read_to_string(&path).unwrap();
    let source_type = SourceType::from_path(&path).unwrap();
    let allocator = Allocator::default();
    Parser::new(&allocator, &source_text, source_type).parse();
}
