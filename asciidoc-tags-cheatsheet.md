# Integrail Discovery Workshop AsciiDoc Tags Cheatsheet

This cheatsheet documents all the available formatting tags for use in the Integrail Discovery Workshop slide `.adoc` files.

## Text Formatting and Layout Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `[.small-text-bullets]` | Reduces bullet point text to 70% of normal size | <pre>[.small-text-bullets]<br>* First small bullet<br>* Second small bullet</pre> |
| `[.text-left]` | Aligns text to the left | <pre>[.text-left]<br>This text is left-aligned.</pre> |
| `[.h2-style]` | Formats text in an h2 heading style | <pre>[.h2-style]<br>Heading Text</pre> |
| `[.h3-style]` | Formats text in an h3 heading style | <pre>[.h3-style]<br>Heading Text</pre> |
| `[.h4-style]` | Formats text in an h4 heading style | <pre>[.h4-style]<br>Heading Text</pre> |
| `[.columns]` | Creates a columnar layout container | <pre>[.columns]<br>===<br><br>[.column]<br>--<br>Column 1 content<br>--<br><br>[.column]<br>--<br>Column 2 content<br>--<br>===</pre> |
| `[.column]` | Defines content for a single column (used within `[.columns]`) | <pre>[.column]<br>--<br>Column content here<br>--</pre> |
| `[.two-column-layout]` | Alternative way to create a two-column layout | <pre>[.two-column-layout]<br>--<br>Content with two columns<br>--</pre> |

## Image and Diagram Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `[.full-diagram]` | Images take up 80% of viewport height | <pre>image::path/to/image.png[alt text, .full-diagram]</pre> |
| `[.half-diagram]` | Images take up 50% of viewport height | <pre>image::path/to/image.png[alt text, .half-diagram]</pre> |
| `[.quarter-diagram]` | Images take up 30% of viewport height | <pre>image::path/to/image.png[alt text, .quarter-diagram]</pre> |

## Table Formatting Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `[.small-font-table]` | Creates tables with smaller font sizes | <pre>[.small-font-table]<br>\|===<br>\| Header 1 \| Header 2<br>\| Data 1 \| Data 2<br>\|===</pre> |
| `[.data-table]` | For data tables (uses monospace font) | <pre>[.data-table]<br>\|===<br>\| ID \| Value<br>\| 1 \| "foo"<br>\|===</pre> |
| `[.index-table]` | Specialized table with dashed borders | <pre>[.index-table]<br>\|===<br>\| Index \| Column<br>\| idx_name \| col_name<br>\|===</pre> |
| `[.result-set-table]` | For SQL result sets | <pre>[.result-set-table]<br>\|===<br>\| id \| name<br>\| 1 \| "foo"<br>\|===</pre> |
| `[.kv-table]` | For key-value tables | <pre>[.kv-table]<br>\|===<br>\| Key \| Value<br>\| "key1" \| "value1"<br>\|===</pre> |
| `[.top-caption]` | Places caption above table/figure | <pre>[.top-caption]<br>.Table Title<br>[.small-font-table]<br>\|===<br>\| Header \| Header<br>\| Data \| Data<br>\|===</pre> |

## Presenter Notes

| Tag | Purpose | Example |
|-----|---------|---------|
| `[.notes]` | Speaker notes (visible in presenter mode) | <pre>[.notes]<br>--<br>Speaker notes go here. These will<br>not display during the presentation.<br>--</pre> |

## Mark/Highlight Tags (Inline)

| Tag | Purpose | Example |
|-----|---------|---------|
| `[.mark]` | Highlights text with cyan background | `This is [.mark]#highlighted# text` |
| `[.mark-gold]` | Highlights text with gold background | `This is [.mark-gold]#highlighted# text` |
| `[.mark-violet]` | Highlights text with violet background | `This is [.mark-violet]#highlighted# text` |

## Text Style Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `[.greyed-list]` | Makes list items appear grey | <pre>[.greyed-list]<br>* This list item is grey<br>* So is this one</pre> |
| `[.greyed-text]` | Makes text appear grey | <pre>[.greyed-text]<br>This text appears grey.</pre> |

## General Usage Pattern

For block elements:
```
[.tag-name]
--
Your content here
--
```

For inline elements:
```
This is text with [.tag-name]#styled content# in the middle.
```

For tables, images, and other elements:
```
[.tag-name]
|===
| Header 1 | Header 2
| Data 1   | Data 2
|===
```

## Tips for Working with AsciiDoc Slides

1. You can combine multiple tags for more complex formatting
2. Always preview your slides after making changes
3. Speaker notes (`[.notes]`) are only visible in presenter mode
4. Use the appropriate table style based on the content you're displaying
5. When formatting code blocks, use the correct language for syntax highlighting

---

_This cheatsheet was created for Integrail Discovery Workshop content development._
