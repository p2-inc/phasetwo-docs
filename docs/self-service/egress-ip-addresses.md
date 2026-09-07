---
id: egress-ip-addresses
title: Egress IP Addresses
description: The static outbound IP addresses Phase Two clusters send traffic from, for use in customer firewall and API allowlists.
---

## Egress IP Addresses

If you need to allowlist Phase Two's outbound traffic — for an SMTP relay, an IP-restricted API, or your own firewall — use the addresses below for your cluster's region. These are the addresses your cluster sends traffic *from*, which are not the same as the addresses your users connect *to*.

Allowlist **all three addresses** for your region. Traffic may originate from any of them.

### AWS US East (N. Virginia) `us-east-1`

```
107.21.236.246
44.196.71.119
44.215.167.145
```

### AWS US West (Oregon) `us-west-2`

```
18.236.0.114
100.21.229.162
34.213.242.117
```

### AWS Europe (Frankfurt) `eu-central-1`

```
3.123.175.173
3.77.61.190
3.68.147.134
```

### AWS Asia-Pacific (Singapore) `ap-southeast-1`

```
18.138.157.250
52.220.138.137
18.141.109.193
```

## Changes to these addresses

These addresses are static and we do not expect them to change. If they ever do, we will announce the change in a release notification before it takes effect.

Your egress addresses will change if your cluster is migrated to a different region.

If you are unsure which region your cluster runs in, or you need these addresses confirmed for a compliance review, contact [support@phasetwo.io](mailto:support@phasetwo.io).
