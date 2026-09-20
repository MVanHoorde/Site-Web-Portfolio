#!/usr/bin/env python3
"""
animer.py — injecte le minutage `<p:timing>` dans les diapositives.

POURQUOI — python-pptx ne sait pas poser d'animations. On construit donc le
diaporama d'abord, en relevant au passage quelles formes composent chaque
étape (voir `Sequence` dans `gabarit_diapo.py`), puis on écrit ici le XML du
minutage directement dans l'arbre de chaque diapositive.

DEUX PIÈGES QUI COÛTENT UNE PASSE CHACUN
1. **Un `<p:cTn id>` en double rend le fichier illisible par PowerPoint.**
   Le compteur est unique et croissant sur tout l'arbre d'une diapositive.
2. **Si toutes les formes portent `clickEffect`, il faut autant de clics que
   de formes** — 49 rien que pour une diapositive dense. La PREMIÈRE forme
   d'une étape porte `clickEffect`, les suivantes `withEffect` : elles
   apparaissent ensemble, au même clic.

L'effet est un fondu d'entrée de 0,4 s (presetID 10 = Fade).
"""

import copy
from lxml import etree

NS = {
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
}
P = NS["p"]
DUREE = 400          # ms — fondu d'entrée


def _e(balise, **attrs):
    el = etree.SubElement if False else etree.Element
    return el(f"{{{P}}}{balise}", {k: str(v) for k, v in attrs.items()})


def _sous(parent, balise, **attrs):
    return etree.SubElement(parent, f"{{{P}}}{balise}",
                            {k: str(v) for k, v in attrs.items()})


class Compteur:
    """Identifiants de minutage : uniques et croissants, sinon PowerPoint
    déclare le fichier illisible."""

    def __init__(self):
        self.n = 0

    def __call__(self):
        self.n += 1
        return self.n


def _effet(parent, shape_id, cid, premier):
    """Un fondu d'entrée sur une forme. `premier` → clic, sinon simultané."""
    par = _sous(parent, "par")
    ctn = _sous(par, "cTn", id=cid(), presetID=10, presetClass="entr",
                presetSubtype=0, fill="hold", grpId=0,
                nodeType="clickEffect" if premier else "withEffect")
    st = _sous(ctn, "stCondLst")
    _sous(st, "cond", delay=0)
    enfants = _sous(ctn, "childTnLst")

    # 1 · rendre la forme visible
    jeu = _sous(enfants, "set")
    cb = _sous(jeu, "cBhvr")
    c2 = _sous(cb, "cTn", id=cid(), dur=1, fill="hold")
    s2 = _sous(c2, "stCondLst")
    _sous(s2, "cond", delay=0)
    tgt = _sous(cb, "tgtEl")
    _sous(tgt, "spTgt", spid=shape_id)
    att = _sous(cb, "attrNameLst")
    an = _sous(att, "attrName")
    an.text = "style.visibility"
    to = _sous(jeu, "to")
    _sous(to, "strVal", val="visible")

    # 2 · le fondu proprement dit
    eff = _sous(enfants, "animEffect", transition="in", filter="fade")
    cb = _sous(eff, "cBhvr")
    _sous(cb, "cTn", id=cid(), dur=DUREE)
    tgt = _sous(cb, "tgtEl")
    _sous(tgt, "spTgt", spid=shape_id)


def _etape(parent, ids, cid):
    """Un clic = une étape = une ou plusieurs formes qui apparaissent."""
    par = _sous(parent, "par")
    ctn = _sous(par, "cTn", id=cid(), fill="hold")
    st = _sous(ctn, "stCondLst")
    _sous(st, "cond", delay="indefinite")
    enfants = _sous(ctn, "childTnLst")

    par2 = _sous(enfants, "par")
    ctn2 = _sous(par2, "cTn", id=cid(), fill="hold")
    st2 = _sous(ctn2, "stCondLst")
    _sous(st2, "cond", delay=0)
    enfants2 = _sous(ctn2, "childTnLst")

    for k, sid in enumerate(ids):
        _effet(enfants2, sid, cid, premier=(k == 0))


def minuter(diapositive, etapes):
    """Pose le `<p:timing>` d'une diapositive. `etapes` = [[ids], [ids], …]."""
    if not etapes:
        return 0
    sld = diapositive._element
    for ancien in sld.findall(f"{{{P}}}timing"):
        sld.remove(ancien)

    cid = Compteur()
    timing = _e("timing")
    tnLst = _sous(timing, "tnLst")
    par = _sous(tnLst, "par")
    racine = _sous(par, "cTn", id=cid(), dur="indefinite", restart="never",
                   nodeType="tmRoot")
    enfants = _sous(racine, "childTnLst")
    seq = _sous(enfants, "seq", concurrent=1, nextAc="seek")
    principal = _sous(seq, "cTn", id=cid(), dur="indefinite",
                      nodeType="mainSeq")
    liste = _sous(principal, "childTnLst")
    for ids in etapes:
        _etape(liste, ids, cid)

    prev = _sous(seq, "prevCondLst")
    c = _sous(prev, "cond", evt="onPrev", delay=0)
    t = _sous(c, "tgtEl")
    _sous(t, "sldTgt")
    suiv = _sous(seq, "nextCondLst")
    c = _sous(suiv, "cond", evt="onNext", delay=0)
    t = _sous(c, "tgtEl")
    _sous(t, "sldTgt")

    # dans CT_Slide, timing vient APRÈS cSld, clrMapOvr et transition
    sld.append(timing)
    return len(etapes)


def controler(diapositive):
    """Relit le minutage posé : nombre de clics, identifiants en double,
    cibles orphelines. Un défaut ici rend le fichier illisible — mieux vaut
    l'apprendre du script que de PowerPoint."""
    sld = diapositive._element
    timing = sld.find(f"{{{P}}}timing")
    if timing is None:
        return {"clics": 0, "doublons": [], "orphelines": []}
    ids = [e.get("id") for e in timing.iter(f"{{{P}}}cTn")]
    doublons = sorted({i for i in ids if ids.count(i) > 1})
    presentes = {str(s.shape_id) for s in diapositive.shapes}
    cibles = {e.get("spid") for e in timing.iter(f"{{{P}}}spTgt")}
    clics = sum(1 for e in timing.iter(f"{{{P}}}cTn")
                if e.get("nodeType") == "clickEffect")
    return {"clics": clics, "doublons": doublons,
            "orphelines": sorted(cibles - presentes)}
