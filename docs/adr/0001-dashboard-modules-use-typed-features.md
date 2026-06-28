# Dashboard Modules Use Typed Features

The boilerplate no longer uses a configurable generic CRUD as the native
dashboard foundation. Dashboard sections start with a small generic shell and
grow through typed feature modules and dedicated routes, following the pattern
validated in client projects such as RLE. This trades early prototyping speed
for clearer ownership, safer permissions, and fewer dynamic schemas to unwind
when a project matures.

**Status**: accepted

**Consequences**: the fresh dashboard exposes only stable generic sections.
Future business modules must add their own feature boundary, schema, services,
actions, screens, and dashboard navigation entries instead of storing durable
business rules in dynamic CRUD records.
