# Issue PDF builder

Turns a Founder File (`src/content/files/<slug>.md`) into the branded PDF you upload on the admin page.

One-time setup (needs `npm install` first, for the brand fonts):

```bash
python3 -m venv scripts/issue-pdf/.venv
scripts/issue-pdf/.venv/bin/pip install reportlab fonttools brotli pyyaml
scripts/issue-pdf/.venv/bin/python scripts/issue-pdf/make-fonts.py
```

Each issue:

```bash
scripts/issue-pdf/.venv/bin/python scripts/issue-pdf/make-pdf.py src/content/files/sam-altman.md issues/file-001-sam-altman.pdf
```

The header date and file number come from the file's frontmatter (`publishDate`, `fileNumber`). `fonts/` and `.venv/` are git-ignored.
