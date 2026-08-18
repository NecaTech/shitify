# NecaTech Boilerplate

This context defines the stable vocabulary for the reusable application
boilerplate. One project represents one client application and one client
organization, while technical ownership stays outside client governance.

## Language

**Founder**:
The global technical owner or maintainer of the application. A **Founder** sits
above client roles and workspace membership.
_Avoid_: Workspace owner, client admin, seed admin

**Application Role**:
A global user role reserved for platform-level authority, independently of
workspace membership. The boilerplate keeps this category intentionally narrow.
_Avoid_: Workspace role, membership role

**User**:
The default application role for a person who has no platform-level authority.
Client permissions for a **User** come from workspace membership.
_Avoid_: Application admin, global member

**Workspace Role**:
A role scoped to one workspace membership. A **Workspace Role** governs client
collaboration inside a specific workspace and does not grant global technical
authority.
_Avoid_: Application role, global role

**Trusted Maintenance Procedure**:
A platform-controlled operation allowed to manage platform authority. Client
workspace roles are never trusted maintenance procedures.
_Avoid_: Client administration, workspace management

**Owner**:
The highest client-side workspace role. An **Owner** governs a client workspace
but does not outrank a **Founder**.
_Avoid_: Founder, platform owner

**Admin**:
A client-side workspace role below **Owner** and above operational workspace
roles.
_Avoid_: Founder, application admin, global admin

**Manager**:
A client-side workspace role below **Admin** and above execution roles.
_Avoid_: Admin, founder

**Staff**:
A client-side workspace role for internal operational contributors.
_Avoid_: Manager, editor

**Editor**:
A client-side workspace role for content or data contribution.
_Avoid_: Staff, viewer

**Viewer**:
The lowest client-side workspace role, intended for read-only access.
_Avoid_: Guest, member

**Client Organization**:
The organization represented by a project created from the boilerplate. In the
boilerplate model, one project corresponds to one client organization.
_Avoid_: Tenant, account, platform organization

**Initial Workspace**:
The first generic workspace created for a project. It represents the client
organization but does not make the **Founder** a workspace member.
_Avoid_: Founder workspace, platform workspace

**Pilote**:
The dashboard home view. **Pilote** is the entry point for steering the private
space, not a separate client business module and not a project status.
_Avoid_: Home page, landing page, client module, pilot project

**Member Invitation**:
The intended onboarding path for future client members: an authorized user
creates a member with minimal identity information, then the invited person
activates access through a trusted email link.
_Avoid_: Public signup, hardcoded password, demo account

**Catalog**:
The reusable workshop library outside `src/`. It stores invariants, business
grafts, and compositions that can be grafted into a client project during
development and removed before staging.
_Avoid_: Runtime dependency, production module, backup dump

**Invariant**:
A reusable rule or guarantee that can apply across several business domains.
An **Invariant** is not a complete business feature; it describes something that
must remain true, such as platform role separation, workspace scoping, or
authorized workflow transitions.
_Avoid_: Feature, page, table

**Business Graft**:
A portable package for a reusable business logic. A **Business Graft** includes
its manifest, invariants, schemas, capabilities, role templates, navigation,
routes, workflows, statuses, tests, and integration notes.
_Avoid_: Backup, snippet, generic CRUD module

**Composition**:
A validated assembly of invariants and business grafts used to shape a client
project during development. A **Composition** must be materialized into `src/`
before staging.
_Avoid_: Deployed client project, runtime plugin

**Active Implementation**:
The code currently integrated in `src/` and executed by the application. Active
implementations are what remains in a client project after specialization.
_Avoid_: Catalog entry, archive

## Shitify Product Vocabulary

Shitify est un projet client construit sur le boilerplate. Ce vocabulaire
complète le vocabulaire plateforme ci-dessus pour le produit Shitify.

**Shitify**:
The product itself: a generator of absurd, deliberately useless, disposable
prototypes with a seriously competent engine and a shareable, convincingly
presented result — plus the sensationalist startup pitch that goes with it.
_Avoid_: Lovable clone, Bolt clone, AI app builder, random joke generator

**Creation**:
The shareable artifact produced by Shitify from a bad idea: a convincing
prototype plus its sensationalist pitch and satirical metrics. One creation =
idea + prototype + pitch.
_Avoid_: app, product, SaaS, deliverable

**Burn my tokens**:
The retained label for the generation action. Belongs to the product's satirical
voice; the word "shit" is reserved for the brand and must not become a gimmick
repeated in every label.
_Avoid_: Generate, Build my app, Shit this

**My Bullshits**:
The retained label for the user's personal library of creations.
_Avoid_: My projects, My apps, My dashboard

**Prototype**:
A deliberately disposable creation. Shitify never presents a prototype as an
industrialized product or a viable business.
_Avoid_: MVP, product, production app

**Pitch**:
The deliberately disproportionate, sensationalist presentation generated for a
creation ("The world's first AI-native mobility infrastructure for birds") — a
deadpan, first-degree parodic startup landing that frames the prototype as its
"live demo", with manifestly satirical metrics (TAM, birds interviewed, revenue,
imaginary valuation). Its copy never uses vulgarities or the word "shit".
_Avoid_: value proposition, business plan, real pitch

**Vanity metric**:
A manifestly satirical, unverifiable success figure presented in a Pitch (TAM,
revenue, imaginary valuation, fictional validation counts), at least one of
which is derived from the creation's specific idea.
_Avoid_: real KPI, business metric

**Endossement**:
The community's single passive reaction to a creation: a binary, cumulative,
deadpan signal of endorsement in the startup register — one backs a pitch as if
it were a real announcement, never by naming its absurdity. Its exact label is
fixed by the surface vocabulary.
_Avoid_: like, upvote, "most absurd"

**Remix**:
A new independent creation forked from a shared creation to push its absurdity
further — the community form of Surenchère. The source stays intact and is
visibly credited ("une surenchère de X"), keeping the escalation chain legible.
_Avoid_: edit of the original, fork without lineage

**Surenchère**:
The escalation of absurdity: pushing a creation's idea further toward greater
uselessness or disproportion — more features, more sophistication, more inflated
claims — proposed by Shitify or driven by the user, never applied automatically.
On one's own creation it is iteration escalation; on another's it is a Remix
(the community one-upmanship).
_Avoid_: gamification, feature creep

**Voix**:
The two deliberate surface voices of Shitify, split by function: the
**chrome** (French — the operator interface: navigation, forms, onboarding,
progression, errors, empty states, confirmations) and the **performance**
(English — the satirical startup theater: the pitch and any sensationalist
self-presentation). `Burn my tokens` and `My Bullshits` remain English brand
nouns inside the French chrome.
_Avoid_: single-language UI, accidental bilingualism, self-mocking copy

## Flagged Ambiguities

**Pilote vs. pilot project**:
**Pilote** names the dashboard home view. A pilot project is a separate business
arrangement and must not be introduced into boilerplate UI copy.

## Example Dialogue

Dev: "Should the founder be added as an owner to every workspace?"

Domain expert: "No. The founder is an application-level authority, not a
workspace member. Workspace roles remain for client governance."

Dev: "Should admin be a global role too?"

Domain expert: "No. Client administration belongs to workspace roles. The global
role stays reserved for platform authority such as the founder."

Dev: "Is owner the same as founder?"

Domain expert: "No. Owner is a client workspace role. Founder is platform-level
technical authority."

Dev: "Should the founder be a member of the initial workspace?"

Domain expert: "No. The initial workspace represents the client organization.
The founder stays outside workspace membership."

Dev: "Can a workspace owner demote the founder?"

Domain expert: "No. Workspace roles administer client membership only. Platform
roles are managed by founders or trusted maintenance procedures."

Dev: "Is Pilote a separate route from the dashboard home?"

Domain expert: "No. Pilote is the dashboard home. Other dashboard sections live
on separate routes."

Dev: "Should the Pilote page mention that the project is a pilot project?"

Domain expert: "No. The shared word is misleading here. Pilote is a dashboard
view, not a project status."

Dev: "Should a client member receive a hardcoded initial password?"

Domain expert: "No. Future member onboarding should use invitations or trusted
email links, configured per client project."

Dev: "Should a validated business logic stay imported from catalog in staging?"

Domain expert: "No. Catalog entries are grafted into src during development.
Before staging, the client project keeps only the active implementation in src
and removes catalog."
