---
id: sla
title: Phase Two Dedicated and Enterprise Clusters Service Level Agreement (SLA)
---

_SLA Last updated: October 24, 2023_

> Please read this Service Level Agreement carefully before subscribing to our Dedicated or Enterprise Cluster offering.

This Service Level Agreement between Phase Two and the customer outlines the level of service, the process by which the customer can request technical support or submit a claim for not meeting the service level and request credit for the period of time service level was not met.

### Uptime

We guarantee at least 99.9% availability on Dedicated plans and 99.99% on Enterprise plans. In case of an outage larger than that occurring during more than one day (24 hours), Phase Two will provide the Customer with service credits equaling an amount of 50% of the monthly equivalent instance’s subscription cost for all outages during a calendar month. Service credits will be calculated in accordance with the following formula :

Service credit = (Annualized subscription cost / 12) \* 50%

### Response and resolution times

- Urgent server-down issues will be resolved within 3 hours. Urgent level is reached when the Customer’s Keycloak deployment has availability issues (user cannot login).
- Routine issues will be acknowledged within 3 working days. Issues within Phase Two’s span of control will also be resolved within 3 working days. Routine priority level is for every other support request.

### How to Claim a SLA Credit

In the unlikely event that Phase Two fails to meet the above-mentioned uptime commitment, Phase Two shall offer service credits as compensation to the customer.

Request for an SLA credit must be submitted in writing, within 30 days from the outage to which they refer, via email to support@phasetwo-io.

### Payment of Compensation

The compensation will be in the form of Phase Two usage credits and may not be exchanged for cash or other forms of payment. All outage periods and compensation are calculated by Phase Two and are based on the plan that the customer is using. Once we’ve verified the outage, we’ll issue an SLA payment as a credit to be used against your invoice for the following month.

Exclusions to the Uptime Guarantee
Phase Two does all that we can to keep your service up and running. However, there are a few things that we can’t be held accountable for. Thus, they are excluded from our SLA. The following events will be exempt from Phase Two's availability guarantee:

- Scheduled interruptions or network/hardware maintenance.
- Customer triggered redeployment (Keycloak version upgrade).
- Load caused on the systems by client queries or usage (including, but not limited to, inaccurate installations and software configurations, abuse of the network, abuse of hardware or overuse of resources).
- Failures or termination of the instance by the cloud providers used by Phase Two to implement the service.
- Failures due to hostile or abusive actions by third parties such as denial-of-service attacks that violate the Agreement.
- The system is not available due to technology failures on customer's side (network, hardware and software, third-party equipment).
- Routing or other faults caused by intermediary or external networks.
- Errors caused by factors outside of Phase Two’s reasonable control.
- Features or Services designated Alpha or Beta or deprecated.
