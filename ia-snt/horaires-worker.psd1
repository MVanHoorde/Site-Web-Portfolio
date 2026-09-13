# ================================================================
#   horaires-worker.psd1  -  QUAND la pré-correction tourne
#   ----------------------------------------------------------------
#   Le seul fichier à retoucher quand l'emploi du temps change.
#   Lu par planifier-worker.ps1 (qui en tire les tâches planifiées)
#   et par boucle-worker.ps1 (qui s'en sert pour savoir s'il est en
#   séance). Après modification : relancer planifier-worker.ps1 en
#   administrateur, sinon les tâches gardent les anciens horaires.
#
#   POURQUOI CE CALENDRIER (13/09/2026)
#   Une passe toutes les 15 minutes, jour et nuit, faisait travailler
#   la carte graphique pour rien. Le besoin réel est double :
#     · pendant les séances de SNT, les copies arrivent au fil de
#       l'eau et doivent être prêtes vite  ->  une passe toutes les
#       5 minutes, avec 15 minutes de marge après la fin pour les
#       élèves qui envoient en retard ;
#     · le reste du temps, deux ramassages suffisent : à l'ouverture
#       de session le matin, et à 18 h si le PC est allumé.
#
#   Jours en anglais : c'est le nom que Windows attend.
#   Heures au format HH:mm, fin de séance SANS la marge.
# ================================================================
@{
  Seances = @(
    @{ Jour = 'Tuesday';  Debut = '11:05'; Fin = '12:20' }
    @{ Jour = 'Thursday'; Debut = '08:15'; Fin = '09:55' }
    @{ Jour = 'Thursday'; Debut = '13:10'; Fin = '14:25' }
    @{ Jour = 'Friday';   Debut = '10:15'; Fin = '11:30' }
  )

  # Passes pendant une séance
  PasSeanceMinutes   = 5
  # Marge après la fin, pour les copies envoyées en retard
  MargeApresMinutes  = 15
  # Le PC est sorti de veille ce délai avant le début : Ollama a le
  # temps de reprendre ses esprits avant la première copie.
  ReveilAvantMinutes = 10

  # Le ramassage du soir (sans réveil : seulement si le PC est allumé)
  HeureDuSoir = '18:00'
}
