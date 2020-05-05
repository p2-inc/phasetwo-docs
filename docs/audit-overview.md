---
id: audit-overview
title: Overview
---

:::note
Please [contact us](mailto:support@phasetwo.io) for access.
:::

An audit log is a chronological record of security-relevant actions that occur in a system. It is used to store evidence of a specific operation, procedure or event. Many enterprise customers of SaaS businesses require an audit log of access, administrative and system events. Companies that have compliance requirements (e.g. SOC 2) may be required to keep such logs in order to produce an official record when obligated to produce proof of compliance. Additionally, developers use audit logs to do root cause analysis of how a complex system produced a failure or arrived in an unexpected state.

Phase Two has built an audit logging system that is used by default internally. All [access](audit-access), [administrative](audit-admin) and system events are recorded in the audit log and made available to the customer to fulfill their requirements. 

The Phase Two audit logging system is also available to the customer to add their system's actions and events. A single [API](audit-api) method with a simple event format allows flexibility in storing context about the action or event. 

Both Phase Two and customer events are available in the administrative application to be searched, filtered and exported for external consumption.
