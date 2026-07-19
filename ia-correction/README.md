# 🚧 Pré-correction assistée par IA — CHANTIER OUVERT

Module de **pré-correction** des productions de la séquence frise/IA (Term ES).
Il prépare le travail de correction de Loïc ; **il ne note jamais**.

## Cadre (acté, non négociable — voir mémoire projet)
1. **AI Act, annexe III / art. 6(3)** : l'évaluation des apprenants par IA est
   « haut risque » (applicable 02/08/2026) ; une **tâche préparatoire** ne l'est
   pas. Ce module reste donc STRICTEMENT préparatoire : critères observés +
   justification argumentée, **zéro note, zéro proposition de note**. Le schéma
   de sortie l'interdit par construction.
2. **Souveraineté de l'enseignant** : chaque sortie porte la mention « préparation
   de correction — la notation appartient à l'enseignant ». Loïc valide tout ;
   note établie et publiée par lui seul (contrôle continu bac : cadre posé aux
   élèves en début d'année — explication possible, négociation non).
3. **RGPD** : le module ne voit QUE des codes (E-07). Il tourne **en local**
   (candidat : Qwen 3 via Ollama). API Claude envisageable UNIQUEMENT après
   analyse RGPD dédiée (transfert de productions d'élèves à un tiers).
4. **Transparence méta** : les critères sont publiés aux élèves ; le
   prompt-cadre est co-écrit avec eux (activité prévue) ; possibilité de
   contestation → relecture humaine tracée.

## Pièces
- `prompt-cadre.md` — le prompt système (V1 Loïc + espace « rédigé par la classe »)
- `criteres-frise.json` — grille de critères de l'éval 1a/1b (publiée)
- `precorrection.mjs` — script d'appel du modèle local (squelette)

## 🚧 Reste à faire
- [ ] Installer Ollama + tirer un modèle (candidats : qwen3, à comparer sur 5 copies témoins)
- [ ] Passer les 5 copies témoins ; mesurer l'accord avec la correction de Loïc
- [ ] Séance « la classe rédige le prompt » (S5) → intégrer leur version
- [ ] Brancher sur le serveur (POST /api/precorrection/:id)
- [ ] Gabarit du relevé élève (critères + justifications + décision de Loïc)
- [ ] Analyse RGPD si option API Claude retenue (sinon la rayer)
