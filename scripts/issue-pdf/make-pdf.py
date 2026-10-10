"""Turn a Founder File (src/content/files/<slug>.md) into the branded PDF that goes out on Sunday.

Usage:  python3 scripts/issue-pdf/make-pdf.py src/content/files/sam-altman.md issues/file-001-sam-altman.pdf
Setup:  see scripts/issue-pdf/README.md
"""
import os
import re
import sys

import yaml
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Flowable, Frame, KeepTogether, NextPageTemplate,
                                PageTemplate, Paragraph, Spacer, Table, TableStyle)

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
SRC, OUT = os.path.abspath(sys.argv[1]), sys.argv[2]
SLUG = os.path.basename(SRC).rsplit(".", 1)[0]

F = HERE + "/fonts/"
pdfmetrics.registerFont(TTFont("SS", F + "SS-Regular.ttf"))
pdfmetrics.registerFont(TTFont("SS-B", F + "SS-Bold.ttf"))
pdfmetrics.registerFont(TTFont("SS-I", F + "SS-Italic.ttf"))
pdfmetrics.registerFont(TTFont("SS-BI", F + "SS-BoldItalic.ttf"))
pdfmetrics.registerFontFamily("SS", normal="SS", bold="SS-B", italic="SS-I", boldItalic="SS-BI")
pdfmetrics.registerFont(TTFont("MONO", F + "JBM-400.ttf"))
pdfmetrics.registerFont(TTFont("MONO-B", F + "JBM-700.ttf"))
pdfmetrics.registerFontFamily("MONO", normal="MONO", bold="MONO-B", italic="MONO", boldItalic="MONO-B")
pdfmetrics.registerFont(TTFont("DISP", REPO + "/src/assets/fonts/Archivo-Black-w85.ttf"))

# Brand tokens (src/styles/tokens.css)
INK = HexColor("#0E1A2B"); SIGNAL = HexColor("#C7431D"); SIGNAL_L = HexColor("#F06A3F")
PAPER = HexColor("#F7F5F0"); MANILA = HexColor("#E8DCC0"); SLATE = HexColor("#33506F")
GRAPH = HexColor("#5B6573"); RULE = HexColor("#E2DDD2"); MUTED = HexColor("#AEB6C2")

raw = open(SRC, encoding="utf-8").read()
_, fm, body = raw.split("---\n", 2)
meta = yaml.safe_load(fm)
NUM = "%03d" % meta["fileNumber"]
pd = meta["publishDate"]
DATE = (pd.strftime("%-d %B %Y") if hasattr(pd, "strftime") else str(pd)).upper()
SHORT = SLUG.replace("-", " ").upper()


def smart(t):
    t = re.sub(r'(^|[\s(\[—-])"', lambda m: m.group(1) + "“", t)
    t = t.replace('"', "”")
    t = re.sub(r"(^|[\s(\[—-])'", lambda m: m.group(1) + "‘", t)
    return t.replace("'", "’")


def inline(t):
    t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    t = smart(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<i>\1</i>", t)
    return re.sub(r"(info@aifounderfiles\.com)", r'<font color="#C7431D">\1</font>', t)


W, H = A4
LM = RM = 22 * mm
BM = 22 * mm
fw = W - LM - RM

st = {
    "body": ParagraphStyle("body", fontName="SS", fontSize=10.8, leading=16.2, textColor=INK, spaceAfter=8.5, alignment=TA_LEFT),
    "h2": ParagraphStyle("h2", fontName="DISP", fontSize=17, leading=19, textColor=INK, spaceBefore=16, spaceAfter=7, keepWithNext=1),
    "label": ParagraphStyle("label", fontName="MONO-B", fontSize=8.2, leading=11, textColor=SIGNAL, spaceAfter=7),
    "title": ParagraphStyle("title", fontName="DISP", fontSize=34, leading=35, textColor=INK, spaceAfter=12),
    "stand": ParagraphStyle("stand", fontName="SS", fontSize=14, leading=20, textColor=SLATE, spaceAfter=16),
    "bullet": ParagraphStyle("bullet", fontName="SS", fontSize=10.8, leading=16, textColor=INK, leftIndent=14, bulletIndent=2, spaceAfter=5),
    "src": ParagraphStyle("src", fontName="SS", fontSize=8.6, leading=12, textColor=GRAPH, leftIndent=14, bulletIndent=0, spaceAfter=3.5),
    "note": ParagraphStyle("note", fontName="SS-I", fontSize=9.6, leading=14, textColor=GRAPH, spaceAfter=8),
    "fk": ParagraphStyle("fk", fontName="MONO-B", fontSize=7.6, leading=11, textColor=INK),
    "fv": ParagraphStyle("fv", fontName="MONO", fontSize=8.8, leading=11.5, textColor=INK),
}


class Rule(Flowable):
    def __init__(self, w):
        super().__init__(); self.w = w
    def wrap(self, aw, ah): return self.w, 6
    def draw(self):
        self.canv.setStrokeColor(RULE); self.canv.setLineWidth(0.8); self.canv.line(0, 3, self.w, 3)


def footer(c, d):
    c.setStrokeColor(RULE); c.setLineWidth(0.8); c.line(LM, 15 * mm, W - RM, 15 * mm)
    c.setFont("MONO", 7.4); c.setFillColor(GRAPH)
    c.drawString(LM, 10.5 * mm, "AIFOUNDERFILES.COM")
    c.drawRightString(W - RM, 10.5 * mm, str(d.page))


def first_page(c, d):
    c.setFillColor(PAPER); c.rect(0, 0, W, H, stroke=0, fill=1)
    band = 20 * mm
    c.setFillColor(INK); c.rect(0, H - band, W, band, stroke=0, fill=1)
    y = H - band / 2 - 5
    c.setFont("DISP", 15); c.setFillColor(PAPER); c.drawString(LM, y, "AI FOUNDER ")
    c.setFillColor(SIGNAL_L); c.drawString(LM + c.stringWidth("AI FOUNDER ", "DISP", 15), y, "FILES")
    c.setFont("MONO", 8); c.setFillColor(MUTED)
    c.drawRightString(W - RM, y + 1, "#" + NUM + " · " + DATE)
    footer(c, d)


def later_page(c, d):
    c.setFillColor(PAPER); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setStrokeColor(RULE); c.setLineWidth(0.8); c.line(LM, H - 16 * mm, W - RM, H - 16 * mm)
    y = H - 13 * mm
    c.setFont("DISP", 9.5); c.setFillColor(INK); c.drawString(LM, y, "AI FOUNDER ")
    c.setFillColor(SIGNAL); c.drawString(LM + c.stringWidth("AI FOUNDER ", "DISP", 9.5), y, "FILES")
    c.setFont("MONO", 7.4); c.setFillColor(GRAPH)
    c.drawRightString(W - RM, y, "FOUNDER FILE #" + NUM + " · " + SHORT)
    footer(c, d)


doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=LM, rightMargin=RM, topMargin=24 * mm, bottomMargin=BM,
                      title="Founder File #" + NUM + ": " + meta["title"], author="AI Founder Files",
                      subject=meta["standfirst"])
pad = dict(leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
f1 = Frame(LM, BM, fw, H - 32 * mm - BM, id="f1", **pad)
f2 = Frame(LM, BM, fw, H - 24 * mm - BM, id="f2", **pad)
doc.addPageTemplates([PageTemplate("first", [f1], onPage=first_page), PageTemplate("later", [f2], onPage=later_page)])

S = []
co, fo = meta["company"], meta["founder"]
S.append(Paragraph("THIS WEEK’S FILE · FOUNDER FILE #" + NUM, st["label"]))
S.append(Paragraph(inline(meta["title"]).upper(), st["title"]))
S.append(Paragraph(inline(meta["standfirst"]), st["stand"]))

rows = [("FOUNDERS" if " and " in fo["name"] else "FOUNDER", fo["name"] + ", " + fo["role"]), ("COMPANY", co["name"]),
        ("FOUNDED", co.get("founded", "Undisclosed")), ("HQ", co.get("hq", "Undisclosed")), ("SECTOR", co["sector"]),
        ("STAGE", co.get("stage", "Undisclosed")), ("FUNDING", co.get("funding", "Undisclosed")),
        ("MODEL", co.get("businessModel", "Undisclosed"))]
inner = Table([[Paragraph(k, st["fk"]), Paragraph(inline(str(v)), st["fv"])] for k, v in rows],
              colWidths=[24 * mm, fw - 24 * mm - 12 * mm])
inner.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 2.2),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
box = Table([[Paragraph("THE FILE", ParagraphStyle("tf", fontName="MONO-B", fontSize=8.6, leading=11, textColor=INK))], [inner]],
            colWidths=[fw])
box.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), MANILA), ("LINEBELOW", (0, 0), (0, 0), 0.8, HexColor("#C9BD9F")),
                         ("LEFTPADDING", (0, 0), (-1, -1), 6 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 6 * mm),
                         ("TOPPADDING", (0, 0), (0, 0), 4 * mm), ("BOTTOMPADDING", (0, 0), (0, 0), 2.5 * mm),
                         ("TOPPADDING", (0, 1), (0, 1), 2.5 * mm), ("BOTTOMPADDING", (0, 1), (0, 1), 4 * mm)]))
S += [box, Spacer(1, 6 * mm), NextPageTemplate("later")]

bullets, closing_start = [], None


def flush():
    global bullets
    for kind, txt, n in bullets:
        S.append(Paragraph(inline(txt), st["bullet"], bulletText=(str(n) + "." if kind == "ol" else "•")))
    if bullets:
        S.append(Spacer(1, 3))
    bullets = []


def table_flowable(block):
    rows = [[c.strip() for c in ln.strip().strip("|").split("|")] for ln in block.split("\n")]
    rows = [r for r in rows if not all(re.fullmatch(r":?-{2,}:?", c) for c in r)]
    head, data = rows[0], rows[1:]
    n = len(head)
    cell = ParagraphStyle("cell", fontName="SS", fontSize=9.4, leading=12.6, textColor=INK)
    hcell = ParagraphStyle("hcell", fontName="MONO-B", fontSize=7.6, leading=10, textColor=INK)
    weights = [max(12, min(60, max(len(r[i]) for r in rows if i < len(r)))) for i in range(n)]
    widths = [fw * w / sum(weights) for w in weights]
    data_rows = [[Paragraph(inline(c.upper()), hcell) for c in head]] + [[Paragraph(inline(c), cell) for c in r] for r in data]
    t = Table(data_rows, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), MANILA), ("VALIGN", (0, 0), (-1, -1), "TOP"),
                           ("LINEBELOW", (0, 0), (-1, -1), 0.5, RULE), ("TOPPADDING", (0, 0), (-1, -1), 5),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 5), ("LEFTPADDING", (0, 0), (-1, -1), 6),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 6)]))
    return t


def callout_flowable(block):
    paras = [ln[1:].strip() for ln in block.split("\n")]
    items = []
    for ptxt in [x for x in "\n".join(paras).split("\n\n") if x.strip()]:
        items.append(Paragraph(inline(ptxt.replace("\n", " ")), ParagraphStyle(
            "co", fontName="SS", fontSize=10.2, leading=15, textColor=INK, spaceAfter=6)))
    t = Table([[items]], colWidths=[fw])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), MANILA), ("LEFTPADDING", (0, 0), (-1, -1), 6 * mm),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 6 * mm), ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
                           ("LINEBEFORE", (0, 0), (0, -1), 3, SIGNAL)]))
    return t


for b in [b.strip() for b in body.strip().split("\n\n") if b.strip()]:
    if b.startswith("|"):
        flush(); S += [table_flowable(b), Spacer(1, 8)]
    elif b.startswith(">"):
        flush(); S += [callout_flowable(b), Spacer(1, 8)]
    elif b.startswith("## "):
        flush(); S.append(Paragraph(inline(b[3:]).upper(), st["h2"]))
    elif b == "---":
        flush(); closing_start = len(S); S += [Spacer(1, 4), Rule(fw), Spacer(1, 6)]
    elif re.match(r"^(- |\d+\. )", b):
        for line in b.split("\n"):
            m = re.match(r"^(\d+)\. (.*)", line)
            bullets.append(("ol", m.group(2), int(m.group(1))) if m else ("ul", line[2:], 0))
        flush()
    elif b.startswith("*") and b.endswith("*") and not b.startswith("**"):
        flush(); S.append(Paragraph(inline(b), st["note"]))
    else:
        flush(); S.append(Paragraph(inline(b.replace("\n", " ")), st["body"]))
flush()
if closing_start is not None:  # keep the sign-off and disclosure together on one page
    S[closing_start:] = [KeepTogether(S[closing_start:])]

S += [Spacer(1, 6), Paragraph("SOURCES", st["h2"])]
for s in meta["sources"]:
    host = s["url"].split("/")[2].replace("www.", "")
    S.append(Paragraph('%s <font color="#33506F"><link href="%s">%s</link></font>' % (inline(s["title"]) + ".", s["url"], host),
                       st["src"], bulletText="•"))

doc.build(S)
print("built", OUT)
