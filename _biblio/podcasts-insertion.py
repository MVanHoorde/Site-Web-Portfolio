"""
podcasts.py — Insere les references aux 18 episodes France Culture
dans les 8 sequences SNT.

Ancrage STRUCTUREL : on repere le <h3 class="step-title"> d'une etape, puis on
insere en tete du <div class="card-body"> qui suit. Si le titre est absent ou
present plusieurs fois, l'insertion est REFUSEE et signalee.

Idempotent : tout bloc pose porte data-podcast="<cle>" ; si la cle est deja
dans la page, on saute.

    python3 podcasts.py            -> simulation, rapport seul
    python3 podcasts.py --apply    -> ecriture
"""

import re
import sys
from pathlib import Path

PAGES = Path("repo/Site-Web-Portfolio/pages")
RF = "https://www.radiofrance.fr"
S1P = f"{RF}/franceculture/podcasts/une-histoire-de"
S2P = f"{RF}/franceculture/podcasts/ils-ont-change-le-monde"

# ------------------------------------------------------------------ episodes

EP = {
 "s1e1": ("1969 : on a parlé sur les réseaux", f"{S1P}/1969-on-a-parle-sur-les-reseaux-9357188"),
 "s1e2": ("Cyclades : la France a failli inventer Internet", f"{S1P}/cyclades-la-france-a-failli-inventer-internet-6295923"),
 "s1e3": ("Internet au pays des Soviets", f"{S1P}/internet-au-pays-des-soviets-8654118"),
 "s1e4": ("La Chine, Internet et la Grande Muraille", f"{S1P}/la-chine-internet-et-la-grande-muraille-4141178"),
 "s1e5": ("L'Europe crée le web (et les États-Unis s'en emparent)", f"{S1P}/l-europe-cree-le-web-et-les-etats-unis-s-en-emparent-2481778"),
 "s1e6": ("Les enfants terribles du réseau", f"{S1P}/les-enfants-terribles-du-reseau-8597197"),
 "s1e7": ("Y a-t-il un pilote dans le Net ?", f"{S1P}/y-a-t-il-un-pilote-dans-le-net-5590136"),
 "s1e8": ("Vie ou mort d'une utopie ?", f"{S1P}/vie-ou-mort-d-une-utopie-8575962"),
 "s2e1": ("1842-1843 : la naissance du langage informatique", f"{S2P}/1842-1843-la-naissance-du-langage-informatique-9451530"),
 "s2e2": ("1942-1946 : l'ENIAC, le premier ordinateur électronique", f"{S2P}/1942-1946-l-eniac-le-premier-ordinateur-electronique-8504767"),
 "s2e3": ("1950-1960 : les puces électroniques, aux origines de la Silicon Valley", f"{S2P}/1950-1960-les-puces-electroniques-aux-origines-de-la-silicon-valley-8486908"),
 "s2e4": ("1969 : Arpanet, l'ancêtre d'internet", f"{S2P}/1969-arpanet-l-ancetre-d-internet-6817526"),
 "s2e5": ("1981 : l'IBM PC, le premier ordinateur personnel", f"{S2P}/1981-l-ibm-pc-le-premier-ordinateur-personnel-9084890"),
 "s2e6": ("1991 : quand le web devient accessible", f"{S2P}/1991-quand-le-web-devient-accessible-9206848"),
 "s2e7": ("1998 : la recherche selon Google", f"{S2P}/1998-la-recherche-selon-google-3318027"),
 "s2e8": ("2007 : l'avènement du smartphone", f"{S2P}/2007-l-avenement-du-smartphone-7418823"),
 "s2e9": ("2010 : le cloud ou l'ère du « big data »", f"{S2P}/2010-le-cloud-ou-l-ere-du-big-data-2363558"),
 "s2e10": ("2017 : quand l'IA devient notre assistante personnelle", f"{S2P}/2017-quand-l-ia-devient-notre-assistante-personnelle-2128121"),
}

SERIE = {
 "s1": "Une histoire de… l'Internet — France Culture, 2022 · 14 min",
 "s2": "La révolution numérique — France Culture, 2026 · 1 h",
}

# ------------------------------------------------------------------ fabriques

def a_ep(cle, note=""):
    titre, url = EP[cle]
    s = SERIE["s1" if cle.startswith("s1") else "s2"]
    n = f" — {note}" if note else ""
    return (f'<a href="{url}" target="_blank" rel="noopener">'
            f'🎧 {titre} · <i>{s}</i>{n}</a>')


def bloc_ecoute(cle, titre_bloc, liens):
    """Bloc .biblio maison, marque par data-podcast."""
    corps = "\n              ".join(liens)
    return (f'\n            <div class="biblio" data-podcast="{cle}">\n'
            f'              <div class="bl">{titre_bloc}</div>\n'
            f'              {corps}\n'
            f'            </div>\n')


def bloc_citation(cle, texte, auteur, qualite, ep_cle, reperage):
    titre, url = EP[ep_cle]
    return (
     f'\n            <figure data-podcast="{cle}" style="margin:14px 0;padding:11px 14px;'
     f'background:var(--surface-2);border-left:3px solid var(--link);border-radius:0 9px 9px 0">\n'
     f'              <blockquote style="margin:0;font-size:14.5px;line-height:1.55">{texte}</blockquote>\n'
     f'              <figcaption style="margin-top:9px;font-size:12.5px;color:var(--ink-soft)">'
     f'— <b>{auteur}</b>, {qualite}. <a href="{url}" target="_blank" rel="noopener">{titre}</a>'
     f' · {reperage}</figcaption>\n'
     f'            </figure>\n')


def bloc_texte(cle, html):
    return (f'\n            <p data-podcast="{cle}" style="font-size:14.5px;line-height:1.6;'
            f'margin:12px 0">{html}</p>\n')


# ------------------------------------------------------------------ chantier

def note_chantier(cle, emoji, texte):
    return (f'\n            <!-- CHANTIER -->\n'
            f'            <aside class="chantier" data-podcast="{cle}">\n'
            f'              <div class="cl">{emoji} Décision en attente</div>\n'
            f'              {texte}\n'
            f'            </aside>\n'
            f'            <!-- /CHANTIER -->\n')


# ------------------------------------------------------------------ programme
# (fichier, titre d'etape exact, bloc html)

T0 = "2nde-snt-t0-systemes-informatises.html"
T1 = "2nde-snt-t1-internet.html"
T2 = "2nde-snt-t2-le-web.html"
T3 = "2nde-snt-t3-reseaux-sociaux.html"
T4 = "2nde-snt-t4-donnees-structurees.html"
T5 = "2nde-snt-t5-localisation-cartographie.html"
T6 = "2nde-snt-t6-informatique-embarquee.html"
T7 = "2nde-snt-t7-photographie-numerique.html"

PROGRAMME = [

 # ================= T1 Internet =================
 (T1, "Aux origines d'Internet", bloc_texte("pc-lick",
   "<b>Au départ, un projet de bibliothèque.</b> L'homme qui lance ARPANET, "
   "<b>Joseph Licklider</b>, ne cherche pas à survivre à une frappe nucléaire : il rêve "
   "d'une <b>bibliothèque universelle</b> et veut faire communiquer les chercheurs entre eux. "
   "L'objectif d'origine est documentaire et coopératif — ce qui explique que le réseau ait "
   "d'abord servi à s'échanger des articles… et des blagues de laboratoire.")),

 (T1, "Aux origines d'Internet", bloc_ecoute("pc-t1-origines",
   "🎧 Pour creuser — version longue", [a_ep("s2e4", "l'épisode d'une heure, avec deux chercheurs")])),

 (T1, "re:<h4>Louis Pouzin[^<]*</h4>", bloc_citation(
   "pc-pouzin-theatre",
   "Pour comprendre le datagramme, Louis Pouzin prenait l'image d'une salle de théâtre : "
   "on peut faire asseoir les spectateurs d'un rang dans l'ordre, place 10 puis 9 puis 8 — "
   "ou les laisser arriver en désordre et gagner chacun leur place. À la fin, le rang est "
   "constitué dans les deux cas.",
   "Valérie Schafer", "historienne des réseaux, université du Luxembourg",
   "s1e2", "vers 4 min")),

 (T1, "re:<h4>Louis Pouzin[^<]*</h4>", bloc_ecoute("pc-t1-cyclades",
   "🎧 Pour écouter — l'épisode consacré à CYCLADES", [
     a_ep("s1e2", "avec Louis Pouzin lui-même au micro"),
     '<a href="https://www.radiofrance.fr/franceculture/podcasts/une-histoire-de" target="_blank" rel="noopener">📚 Valérie Schafer, <i>En construction. La fabrique française d\'Internet et du Web dans les années 1990</i>, INA Éditions</a>',
   ])),

 (T1, "Les câbles sous-marins&nbsp;: l'autoroute invisible", bloc_citation(
   "pc-cables",
   "Chaque année, je demande à mes étudiants quelle part d'Internet passe par les satellites. "
   "Une grande partie d'entre eux pense que l'essentiel vient de là — alors que plus de 95 % "
   "de la connexion que nous utilisons tous les jours passe par les câbles sous-marins. "
   "On en compte environ 400 dans le monde.",
   "Jean-Christophe Plantin", "chercheur à la London School of Economics",
   "s1e8", "vers 3 min")),

 (T1, "Le DNS&nbsp;: l'annuaire d'Internet", bloc_citation(
   "pc-postel",
   "Jusqu'à la création de l'ICANN en 1998, l'annuaire d'Internet a tenu sur une liste "
   "d'adresses entretenue de façon artisanale, en solo, par une seule personne : Jon Postel. "
   "Pendant près de vingt ans, le réseau a fonctionné grâce à quelqu'un qui mettait les bonnes "
   "adresses au bon endroit.",
   "Francesca Musiani", "chercheuse au Centre Internet et Société (CNRS)",
   "s1e7", "vers 1 min")),

 (T1, "Le DNS&nbsp;: l'annuaire d'Internet", bloc_ecoute("pc-t1-dns",
   "🎧 Pour écouter — qui gouverne Internet ?", [a_ep("s1e7")])),

 (T1, "Débat&nbsp;: Internet a-t-il tenu ses promesses&nbsp;?", bloc_ecoute("pc-t1-debat",
   "🎧 Pour écouter avant le débat", [
     a_ep("s1e8", "l'épisode pose exactement cette question"),
     a_ep("s1e3", "le cas soviétique"),
     a_ep("s1e4", "le cas chinois"),
   ])),

(T1, "Aux origines d'Internet", note_chantier("pc-volume", "📌",
   "<b>Volume des ressources sur cette séquence.</b> T1 porte désormais sept épisodes de podcast "
   "et trois ajouts de contenu (Licklider, la métaphore du théâtre de Pouzin, l'amorce des câbles "
   "sous-marins). C'est beaucoup pour une seule séquence — <b>décision à prendre : garder tel quel, "
   "élaguer, ou répartir sur une séance supplémentaire.</b> Rien n'est tranché.")),

 # ================= T2 Le Web =================
 (T2, "Le Web n'est pas Internet", bloc_ecoute("pc-t2-web",
   "🎧 Pour écouter — la naissance du Web", [
     a_ep("s1e5", "format court, 14 min"),
     a_ep("s2e6", "version longue, avec Valérie Schafer"),
   ])),

 (T2, "Comment un moteur classe les pages", bloc_citation(
   "pc-google-pub",
   "Les fondateurs de Google affirmaient qu'ils ne feraient jamais de publicité. Ils "
   "expliquaient qu'il serait trop facile d'introduire un petit facteur avantageant "
   "systématiquement les entreprises amies, sans que personne ne s'en rende compte. "
   "On voit qu'ils ont totalement changé.",
   "Guillaume Sire", "maître de conférences, université Toulouse-Capitole",
   "s2e7", "vers 2 min")),

 (T2, "Comment un moteur classe les pages", bloc_ecoute("pc-t2-google",
   "🎧 Pour écouter — une histoire de Google", [
     a_ep("s2e7"),
     '<a href="https://www.editionsladecouverte.fr/" target="_blank" rel="noopener">📚 Guillaume Sire, <i>Les moteurs de recherche</i>, La Découverte, coll. « Repères »</a>',
   ])),

 (T2, "Quand l'IA répond à ta place", bloc_ecoute("pc-t2-ia",
   "🎧 Pour écouter — l'IA dans l'histoire longue", [a_ep("s2e10", "avec une pionnière française du deep learning")])),

 # ================= T3 Réseaux sociaux =================
 (T3, "Pourquoi est-ce si dur de poser son téléphone&nbsp;?", bloc_ecoute("pc-t3-smartphone",
   "🎧 Pour écouter — d'où vient cet objet ?", [a_ep("s2e8", "avec un sociologue et un informaticien")])),

 (T3, "Définition et paysage 2026", bloc_ecoute("pc-t3-communaute",
   "🎧 Pour écouter — d'où vient le mot « communauté » ?", [
     a_ep("s1e6", "de la contre-culture californienne à Mark Zuckerberg"),
     a_ep("s1e4", "un autre modèle : la Chine"),
   ])),

 # ================= t0 Systèmes informatisés =================
 (T0, "Dans le ventre de la machine", bloc_ecoute("pc-t0-machine",
   "🎧 Pour écouter — d'où vient l'ordinateur ?", [
     a_ep("s2e2", "l'ENIAC, 30 tonnes, 1945"),
     a_ep("s2e1", "le tout premier programme, écrit par Ada Lovelace en 1842"),
   ])),

 (T0, "Lire une fiche technique sans se faire avoir", bloc_ecoute("pc-t0-pc",
   "🎧 Pour écouter — comment l'ordinateur est entré chez nous", [a_ep("s2e5")])),

 # ================= T6 Informatique embarquée =================
 (T6, "Des ordinateurs cachés partout", bloc_ecoute("pc-t6-puces",
   "🎧 Pour écouter — la puce électronique", [
     a_ep("s2e3", "le transistor de 1947 et la naissance de la Silicon Valley"),
     a_ep("s2e8", "le smartphone, ordinateur de poche"),
   ])),

 # ================= T5 Localisation =================
 (T5, "Comment ton téléphone sait-il où tu es&nbsp;?", bloc_ecoute("pc-t5-smartphone",
   "🎧 Pour écouter — l'objet qui te localise", [a_ep("s2e8")])),

 # ================= T4 Données structurées =================
 (T4, "Trier et filtrer pour faire parler les données", bloc_ecoute("pc-t4-cloud",
   "🎧 Pour écouter — le cloud n'a rien d'un nuage", [
     a_ep("s2e9", "data centers, électricité, eau : la matérialité du cloud"),
   ])),
]


# ------------------------------------------------------------------ moteur

def motif_titre(titre):
    """Titre tolerant aux espaces insecables et aux balises internes."""
    parts = re.split(r"\s|&nbsp;", titre)
    parts = [re.escape(p) for p in parts if p]
    corps = r"(?:\s|&nbsp;)*".join(parts)
    return re.compile(
        r'<h3 class="step-title">(?:\s|&nbsp;)*' + corps + r'(?:\s|&nbsp;)*</h3>')


def appliquer(ecrire=False):
    par_fichier = {}
    for f, titre, bloc in PROGRAMME:
        par_fichier.setdefault(f, []).append((titre, bloc))

    total_ok = total_refus = total_deja = 0

    for fichier, ops in par_fichier.items():
        chemin = PAGES / fichier
        if not chemin.exists():
            print(f"  FICHIER ABSENT  {fichier}")
            continue
        txt = chemin.read_text(encoding="utf-8")
        avant = txt
        print(f"\n── {fichier}")

        for titre, bloc in ops:
            cle = re.search(r'data-podcast="([^"]+)"', bloc).group(1)
            if f'data-podcast="{cle}"' in txt:
                print(f"   DEJA    {cle}")
                total_deja += 1
                continue
            libre = titre.startswith("re:")
            motif = re.compile(titre[3:]) if libre else motif_titre(titre)
            trouves = list(motif.finditer(txt))
            if len(trouves) != 1:
                print(f"   REFUS   {cle:20s} titre trouvé {len(trouves)}× — « {titre} »")
                total_refus += 1
                continue
            if libre:
                pos = trouves[0].end()
            else:
                m = re.search(r'<div class="card-body">', txt[trouves[0].end():])
                if not m:
                    print(f"   REFUS   {cle:20s} pas de card-body après le titre")
                    total_refus += 1
                    continue
                pos = trouves[0].end() + m.end()
            txt = txt[:pos] + bloc + txt[pos:]
            print(f"   OK      {cle:20s} → {titre[:46]}")
            total_ok += 1

        if txt != avant and ecrire:
            chemin.write_text(txt, encoding="utf-8")

    print(f"\n{'ÉCRIT' if ecrire else 'SIMULATION'} — "
          f"{total_ok} posés · {total_refus} refusés · {total_deja} déjà présents")
    return total_refus


if __name__ == "__main__":
    sys.exit(1 if appliquer("--apply" in sys.argv) else 0)
