"""Cut static TTFs from the brand's variable fonts so reportlab can embed them.

Run once (or after `npm install`): python3 scripts/issue-pdf/make-fonts.py
Output goes to scripts/issue-pdf/fonts/ (git-ignored).
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..")) + "/node_modules/"
OUT = os.path.join(HERE, "fonts") + "/"
os.makedirs(OUT, exist_ok=True)
base = ROOT + "@fontsource-variable/source-serif-4/files/"

# Each instance needs a unique PostScript name, or PDF viewers merge the faces and bold disappears.
INSTANCES = [
    ("source-serif-4-latin-wght-normal.woff2", 400, "SS-Regular", "SourceSerif4-Regular"),
    ("source-serif-4-latin-wght-normal.woff2", 700, "SS-Bold", "SourceSerif4-Bold"),
    ("source-serif-4-latin-wght-italic.woff2", 400, "SS-Italic", "SourceSerif4-Italic"),
    ("source-serif-4-latin-wght-italic.woff2", 700, "SS-BoldItalic", "SourceSerif4-BoldItalic"),
]

for src, wght, out, ps in INSTANCES:
    font = TTFont(base + src)
    font.flavor = None
    inst = instancer.instantiateVariableFont(font, {"wght": wght})
    for rec in inst["name"].names:
        if rec.nameID in (1, 4, 16):
            rec.string = ps.replace("-", " ")
        elif rec.nameID in (2, 17):
            rec.string = "Regular"
        elif rec.nameID == 6:
            rec.string = ps
    inst.save(OUT + out + ".ttf")
    print("made", out)

for w in (400, 700):
    f = TTFont(ROOT + "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-%d-normal.woff2" % w)
    f.flavor = None
    f.save(OUT + "JBM-%d.ttf" % w)
    print("made JBM", w)
