---
name: TDS OpenAPI
repo: kovirlabs/tds-openapi
tagline: A testable, machine-readable version of the TDS standard for booking trips across transit providers.
audience: Transit agencies, demand-response and microtransit providers, and the software vendors that serve them.
support: official
supportedSince: 2026-11-07
featured: true
status: pre-release
order: 35
category: library
platforms: [python]
---

The Transactional Data Specification (TDS, TCRP G-16 / Report 210, 2020) describes what a
trip-booking exchange between demand-response and microtransit providers should contain. TDS
OpenAPI makes it implementable and testable. It provides JSON Schemas for the data model, an
OpenAPI document for booking requests and responses, and an AsyncAPI document for status,
milestone, ETA and custody events.

It comes with a conformance kit, `tds-conform`, that vendors can run against their own endpoint
and agencies can cite in an RFP. The kit writes a self-contained HTML report you can attach to a
response. A reference provider, `tds-mock`, lets you build and demo without a live partner.
Providers that exchange trips in batches instead of calling an API can use the CSV file format and
relay mailbox.

It is not a new standard. It does not replace TDS, GTFS-Flex or GTFS-Realtime.

TDS OpenAPI is a v0.8 draft. Field names are proposed and are still being checked against TDS
2020, so expect changes before 1.0. The paratransit and NEMT profiles are early drafts. Kovir Labs
maintains the project and intends to donate it to a neutral steward.
