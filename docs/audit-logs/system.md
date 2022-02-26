---
id: system
title: System
---

System event types are reported by Phase Two to give the customer information on operational issues with the Phase Two system. Things like system maintenance, scheduled downtime, version updates, outage notifications and more will be published for this event type.

## Event types

All system event types are indicated in the `type` field of the json event with the `system.` prefix. No `authDetails` object will be included as with access, admin and custom event types.
