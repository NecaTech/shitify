# Shitify — Contrat Produit (canonique)

Statut : **source de vérité produit**. Ce document est le cadrage canonique de
Shitify. Toute décision d'architecture, de produit ou de découpage futur doit y
être rapportée. Il ne décrit pas d'implémentation technique ; il fixe ce que le
produit est, ce qu'il n'est pas, et ce qu'il reste à valider.

Compléments :

- vocabulaire stable : `CONTEXT.md` ;
- phases de développement : `docs/development-phases.md` ;
- direction et découpage de travail : `docs/roadmap.md`.

---

## 1. Positionnement

> Shitify est un générateur de prototypes absurdes, volontairement inutiles et
> jetables, dont le moteur est techniquement sérieux et dont le résultat est
> étonnamment convaincant, présentable et partageable — avec le discours
> sensationnaliste de la startup qui va avec.

Shitify reprend la forme d'un outil de vibe coding et inverse sa promesse : il ne
prétend pas permettre de créer une entreprise rentable ni de remplacer
l'ingénierie logicielle. Il permet de créer volontairement des applications
absurdes et inutiles, avec un moteur suffisamment compétent pour qu'elles soient
crédibles et fonctionnelles.

Le produit est simultanément :

- un générateur de prototypes ;
- un terrain de jeu créatif ;
- une machine à trolling ;
- une satire du vibe coding et du théâtre entrepreneurial tech ;
- un format de création et de partage, destiné à devenir communautaire.

## 2. Thèse produit

La capacité à générer du logiciel n'implique pas que ce logiciel possède une
valeur marchande.

Shitify matérialise cette distinction **par l'expérience**, pas par un manifeste.
Il doit être possible de produire une application visuellement convaincante et
fonctionnelle qui :

- ne répond à aucun problème significatif ;
- n'a aucune validation marché ;
- n'a aucun utilisateur réel ;
- n'a aucune raison économique particulière d'exister ;
- peut néanmoins être présentée avec tous les codes d'une startup révolutionnaire.

La satire porte sur la disproportion entre **ce qui a réellement été produit** et
**ce qu'on prétend avoir accompli**. Elle ne repose pas sur l'idée que l'IA
serait incapable de produire du bon code : plus Shitify est techniquement
compétent, plus la démonstration fonctionne.

## 3. Exemple canonique de référence

> Construis une plateforme de transport pour oiseaux afin qu'ils puissent se
> déplacer sans fatiguer leurs ailes.

Cet exemple est la référence produit. Il sert à juger toute décision : si Shitify
ne peut pas matérialiser sérieusement cette idée (interface, interactions,
données fictives, expérience cohérente, résultat partageable), le produit échoue.

Le pitch disproportionné associé :

> The world's first AI-native mobility infrastructure for birds.

Métriques manifestement satiriques attendues :

| Métrique               | Valeur                              |
| ---------------------- | ----------------------------------- |
| TAM                    | every bird on Earth                 |
| Birds interviewed      | 0                                   |
| Revenue                | €0                                  |
| Imaginary valuation    | plusieurs milliards                 |
| Wing fatigue reduction | valeur arbitrairement spectaculaire |

Le prototype et le pitch forment ensemble **la création partageable**.

## 4. Proposition de valeur réelle

Ce que Shitify apporte réellement à ses utilisateurs :

1. **Matérialisation d'idées absurdes** — transformer une mauvaise idée
   volontaire en prototype crédible et fonctionnel, sans effort d'ingénierie.
2. **Terrain de jeu créatif** — expérimenter des concepts impossibles,
   exagérés ou parodiques avec une qualité de rendu sérieuse.
3. **Machine à trolling** — produire des créations qui se moquent
   efficacement des codes startup, avec un résultat partageable.
4. **Satire intelligente** — pour l'initié, une critique par l'expérience du
   théâtre technologique ; pour le non-initié, un divertissement immédiat.
5. **Format communautaire (à terme)** — un espace où la valeur vient des
   créations des utilisateurs, pas des blagues écrites par la plateforme.

## 5. Proposition de valeur satirique

Ce que Shitify démontre en creux :

- la disproportion entre l'effort réel et l'ampleur des prétentions ;
- l'absurdité des promesses « build and monetize your app » ;
- le caractère invérifiable des success stories ;
- la vacuité des métriques vanity (TAM, revenue, valuation) ;
- le vocabulaire de l'AI hype et des buzzwords ;
- l'auto-célébration des fondateurs et des VC ;
- l'overengineering et les architectures disproportionnées ;
- plus largement, le théâtre technologique autour de la création de valeur.

La satire est **vécue**, pas expliquée : le produit fonctionne au premier degré
(une app absurde amusante) et au second degré (une critique du système qui
prétend la produire sérieusement).

## 6. Utilisateurs possibles

| Persona                  | Motivation                                       | Premier degré | Second degré |
| ------------------------ | ------------------------------------------------ | ------------- | ------------ |
| Créateur non-développeur | Construire une app absurde pour le plaisir       | Oui           | Optionnel    |
| Initie tech              | Percevoir les niveaux de satire                  | Oui           | Oui          |
| Troll / provocateur      | Produire du contenu sensationnaliste partageable | Oui           | Partiel      |
| Membre de communauté     | Surenchérir en absurdité, battre les autres      | Oui           | Partiel      |

Hors cible explicite : l'entrepreneur sérieux cherchant un vrai produit ou un
vrai business. Shitify ne doit jamais être vendu comme un raccourci vers une
entreprise rentable — le refuser fait partie du produit.

## 7. Boucle produit — capacités séparées

Boucle conceptuelle à explorer :

**idée absurde → génération → prototype fonctionnel → présentation → pitch
sensationnaliste → publication → réaction communautaire → surenchère**

Elle se décompose en capacités produit clairement séparées :

| #   | Capacité                | Question produit                                                       |
| --- | ----------------------- | ---------------------------------------------------------------------- |
| C1  | Capture de l'idée       | Comment l'utilisateur entre sa mauvaise idée (prompt libre, exemple) ? |
| C2  | Génération du prototype | Comment l'idée devient une application structurée ? (cœur du produit)  |
| C3  | Rendu du prototype      | Comment le prototype est-il exécuté, consulté, interactif ?            |
| C4  | Présentation            | Comment la création est-elle mise en scène (landing, copie) ?          |
| C5  | Pitch sensationnaliste  | Comment le discours disproportionné et les métriques sont générés ?    |
| C6  | Publication             | Comment une création devient partageable ?                             |
| C7  | Réaction communautaire  | Comment les autres réagissent (votes, commentaires, remix) ?           |
| C8  | Surenchère              | Comment la compétition en absurdité est encouragée ?                   |

C1–C6 forment le noyau minimal d'une création partageable. C7–C8 sont la phase
communautaire future ; elles ne conditionnent pas la validation du cœur.

## 8. Invariants

1. **Moteur sérieux, finalité ridicule.** La médiocrité revendiquée concerne les
   idées et leur prétendue valeur, jamais la qualité du moteur. Une génération
   défaillante, une mauvaise UX ou une architecture fragile ne sont pas une
   blague. Shitify doit produire correctement des prototypes absurdes à la
   demande.
2. **L'utilisateur apporte l'absurdité.** Shitify n'est pas un générateur
   aléatoire de blagues : l'utilisateur arrive avec sa propre mauvaise idée et la
   pousse aussi loin qu'il veut. Le système amplifie et matérialise son
   imagination, il ne la remplace pas.
3. **Prototype ≠ produit industrialisé.** Shitify assume que ses créations sont
   des prototypes jetables. Il n'entretient jamais volontairement la confusion
   `prototype généré → logiciel industrialisé → business viable`. Le résultat
   peut être spectaculaire sans prétendre démontrer plus que ce qu'il démontre.
4. **Le troll fait partie du produit.** Le ton n'est pas une couche marketing
   ajoutée après coup : libellés, progression, métriques, publication, pitch,
   erreurs, onboarding peuvent participer à l'expérience satirique. Mais éviter
   la répétition d'une même blague. Le mot **shit** appartient à la marque, pas
   aux libellés : `Burn my tokens` (génération) et `My Bullshits` (répertoire)
   sont retenus ; le reste du vocabulaire cherche la variété et le contraste.
5. **La cible de la satire est large.** Personne n'est automatiquement au-dessus
   de la blague : vibe coders, promesses « build and monetize », success stories,
   métriques vanity, fondateurs autoproclamés, AI hype, buzzwords, VC, devs
   overengineers, architectures disproportionnées. Shitify n'est pas un manifeste
   corporatiste de développeurs contre les vibe coders.
6. **Compréhensible sans connaître le débat.** Un non-développeur doit pouvoir
   utiliser Shitify pour le simple plaisir de construire une app absurde. Un
   initié doit pouvoir percevoir les niveaux supplémentaires de satire. La
   compréhension des références tech ne doit jamais être obligatoire : le premier
   degré doit toujours fonctionner seul.
7. **Le contenu communautaire est le carburant.** À terme, les utilisateurs
   cherchent à surpasser les autres en absurdité. La valeur communautaire vient
   des créations réalisées avec Shitify, pas des blagues écrites par Shitify. Le
   produit est un **format de création et de partage**, pas seulement une
   interface prompt → code.
8. **Open source réellement contributif.** Le dépôt est public et destiné à
   accepter des contributions. De nouvelles mécaniques humoristiques, catégories
   ou comportements doivent pouvoir s'ajouter sans exiger de comprendre tout le
   système — sans sacrifier la cohérence produit à une architecture
   prématurément générique.

## 9. Frontières

### Frontières de produit

Shitify n'est pas :

- un clone de Lovable/Bolt (« construis ton SaaS rentable ») ;
- un générateur de business ou une promesse de revenus ;
- un générateur aléatoire de blagues ;
- un manifeste corporatiste dev contre vibe coders ;
- une plateforme de production de logiciels industrialisés.

### Frontières de la mission actuelle

Ne pas :

- implémenter le builder ;
- choisir prématurément un fournisseur LLM ;
- construire une sandbox ;
- implémenter l'authentification ;
- créer la base de données Neon ;
- concevoir une architecture distribuée ;
- ajouter des dépendances pour anticiper des besoins hypothétiques ;
- transformer cette mission en refonte du boilerplate ;
- modifier le dépôt source du boilerplate ;
- produire une roadmap exhaustive sur plusieurs mois.

## 10. Challenge du concept

Shitify est challengé uniquement là où une contradiction ou un risque concret
existe. Aucun challenge n'est ajouté pour la forme.

### 10.1 Prototype convaincant vs plateforme de production

**Risque** : si la qualité de rendu est trop poussée, Shitify devient un vrai app
builder déguisé et la satire se dissout.

**Décision** : la distinction prototype / produit est portée par le **cadre**
(pitch satirique, métriques absurdes, revendications manifestement fausses), pas
par une qualité technique volontairement dégradée. La qualité du moteur reste
maximale ; c'est la finalité affichée qui reste absurde.

### 10.2 L'utilisateur apporte l'absurdité vs le moteur la fabrique

**Risque** : si le moteur invente l'absurdité tout seul (générateur aléatoire),
l'invariant 2 est violé et le produit devient répétitif.

**Décision** : le moteur **amplifie et matérialise** l'idée de l'utilisateur ; il
peut proposer des directions, mais l'idée source reste l'entrée centrale de la
création. À valider par prototype : jusqu'où l'amplification peut aller sans
voler la place de l'utilisateur.

### 10.3 Satire large vs compréhension sans le débat

**Risque** : la satire ciblant les initiés (AI hype, buzzwords, VC) devient
incompréhensible pour un non-initié.

**Décision** : le premier degré (une app absurde et drôle) doit toujours
fonctionner sans aucune référence tech. Le second degré est un bonus pour
l'initié. C'est un critère de qualité, pas un vœu pieux : toute surface produit
se juge d'abord au premier degré.

### 10.4 Troll et communauté vs limites de contenu

**Risque** : la surenchère communautaire peut dériver vers du contenu réellement
offensant, du harcèlement ou du spam, confondant satire et nuisance.

**Décision** : la satire vise des **cibles systémiques** (codes, promesses,
rhétorique), pas des individus. Des limites de contenu explicites seront
définies avant toute publication publique. Ce n'est pas une contrainte du
prototype local, mais c'est un prérequis de la phase communautaire.

### 10.5 Contributif vs architecture prématurément générique

**Risque** : vouloir des « mécaniques humoristiques extensibles » dès le départ
conduit à un framework inutilement abstrait.

**Décision** : la contribution passe d'abord par des conventions documentées et
des exemples (le pattern feature du boilerplate), pas par une abstraction
générique. La surface d'extension se révèlera par l'usage, pas par anticipation.

## 11. Décidé / Hypothétique / À valider / Futur

### Décidé

- Positionnement et thèse produit.
- Les 8 invariants.
- L'exemple canonique de référence (transport pour oiseaux).
- La boucle produit comme liste de capacités séparées (C1–C8).
- Le vocabulaire retenu : `Burn my tokens`, `My Bullshits`.
- Le noyau minimal : idée → prototype → pitch → création partageable.
- Les frontières de produit et de mission.

### Hypothétique (à examiner sans décider)

- La mécanique de génération (comment une idée devient un prototype structuré).
- Le format exact d'une création (contenu, structure, stockage).
- Le mode de rendu du prototype (interactif, statique, exporté).
- Les mécanismes de partage et de publication.
- Les mécaniques communautaires (votes, remix, classements).

### À valider par prototype

- Le moteur produit-il un prototype « étonnamment convaincant » pour l'exemple
  canonique, sans moteur d'applications industrialisé ?
- La boucle idée → création partageable fonctionne-t-elle en continu, du premier
  au dernier maillon ?
- Le premier degré fonctionne-t-il seul, pour un non-développeur ?
- Le pitch et les métriques satiriques sont-ils crédibles sans être codés en
  dur par exemple ?

### Phase future

- Authentification, base de données Neon, sandbox, choix LLM.
- Communauté : réactions, publication publique, surenchère, modération.
- Catalogue de mécaniques humoristiques réutilisables.
- Déploiement Vercel et environnements staging/production.

## 12. Inconnues avant architecture

Liste explicite des questions à résoudre **avant** de choisir une architecture
majeure :

1. **Qu'est-ce qu'une création ?** — le modèle de données minimal d'une création
   (idée source, prototype, pitch, métriques, métadonnées). Sans cela, aucune
   décision de stockage ni de route.
2. **Comment le moteur transforme-t-il une idée en prototype ?** — interprétation
   de l'idée, choix du gabarit, génération de données fictives, génération de
   pitch. C'est le cœur ; à prototyper sur un cas, pas à concevoir en théorie.
3. **Quel est le mode de rendu du prototype ?** — page statique, composant
   interactif, export, lien public. Impacte le partage et la sandbox (hors
   mission, mais la question du partage minimum est produit).
4. **Où s'arrête le prototype ?** — ce qui est suffisant pour être
   « convaincant » sans être un produit. À définir par l'exemple canonique.
5. **Comment générer le pitch et les métriques sans codage en dur ?** — un
   moteur de pitch (gabarits + données de l'idée) doit être crédible et varié.
6. **Quel est le périmètre de validation minimal ?** — un seul exemple suffit-il
   pour valider le cœur, ou faut-il 2–3 idées contrastées ?
7. **Quand la communauté devient-elle nécessaire ?** — le cœur (C1–C6) doit se
   valider seul ; C7–C8 ne doivent pas polluer le prototype initial.

## 13. Question centrale (garde-fou)

À chaque décision produit ou technique, vérifier :

> **Est-ce que cette décision aide Shitify à transformer une mauvaise idée
> volontaire en prototype étonnamment convaincant et partageable, ou sommes-nous
> simplement en train de construire un énième AI app builder ?**

Si la seconde réponse devient vraie, signaler la dérive et revenir au cadrage.

## 14. Découpage de travail minimal proposé

Objectif de validation : prouver, avec le plus petit effort observable, que le
cœur de Shitify fonctionne — une mauvaise idée volontaire devient un prototype
convaincant et partageable. Le découpage privilégie des **vertical slices
observables** (des bouts de produit qui se voient et se montrent), pas des
couches techniques horizontales.

**Important** : ce découpage est une proposition de validation. Il ne demande
pas de construire le moteur de génération d'applications maintenant.

### V0 — La création canonique (référence de format)

Matérialiser l'exemple canonique « transport pour oiseaux » en une création
complète : prototype crédible + pitch sensationnaliste + métriques satiriques.

- Observable : on peut ouvrir, parcourir et montrer la création canonique.
- Valide : le format d'une création, la barre de qualité « étonnamment
  convaincant », le vocabulaire retenu.
- Ne construit pas le moteur : la création est un artefact de référence, la
  référence contre laquelle toute génération future sera jugée.

### V1 — Boucle minimale idée → création

Une entrée d'idée (prompt libre) produit une création au format défini par V0.

- Observable : saisir une idée absurde, obtenir un prototype + pitch.
- Valide : le cœur C1 → C5 sans moteur d'applications industrialisé (le
  générateur peut commencer par des gabarits et des données fictives ; ce n'est
  pas encore le moteur de génération).
- Ne construit pas le moteur d'applications : la génération minimale sert à
  valider l'expérience, pas à industrialiser la génération.

### V2 — Partage d'une création

Une création devient partageable (lien simple, page publique minimale ou
artefact exporté).

- Observable : copier un lien, l'envoyer, la création s'affiche telle quelle.
- Valide : C6 (publication) et la promesse « résultat partageable ».
- Ne construit pas la communauté : pas de réactions, pas de profil, pas de flux.

### V3 — My Bullshits (répertoire personnel)

Retrouver ses créations dans un répertoire local.

- Observable : mes créations sont listées et reconsultables.
- Valide : la permanence de la création et le vocabulaire `My Bullshits`.
- Peut rester local-first tant que l'authentification et la DB ne sont pas
  décidées.

### Après V0–V3

- Choix LLM et moteur de génération réel (une fois le format et l'expérience
  validés).
- Communauté (C7–C8), publication publique, modération.
- Authentification, Neon, sandbox.

## 15. Prochaine action recommandée

Commencer par **V0 — la création canonique** : matérialiser « transport pour
oiseaux » comme artefact de référence (prototype + pitch + métriques), sans
moteur. C'est la plus petite action qui :

- donne une cible concrète à tout le reste ;
- fixe la barre de qualité (« étonnamment convaincant ») ;
- valide le vocabulaire et le format avant tout investissement en génération ;
- se montre et se teste immédiatement.

Une fois V0 montré et accepté, V1 (boucle minimale) peut commencer.

## 16. Références

- `CONTEXT.md` — vocabulaire stable (voir section Shitify).
- `docs/development-phases.md` — phases dev/staging/prod héritées du boilerplate.
- `docs/roadmap.md` — direction et découpage de travail.
- `AGENTS.md` — contrats de routing et invariants d'architecture.
