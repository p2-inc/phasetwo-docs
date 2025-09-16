---
title: "User Events in Keycloak: Best Practices, Management, and Purging"
slug: user-events-in-keycloak
date: 2025-08-01
authors: phasetwo
tags: [phase_two, keycloak, user_events, admin_events, database, performance]
---

Keycloak tracks various "user events" to provide auditing and monitoring capabilities related to user activities within a realm. These events capture actions performed by users, such as authentication attempts, account management operations, and more.

When these events have been tracked and not purged for a long period, for high traffic installations, trying to change the retention period can lead to a massive performance problem with your installation. We will walk you through what to consider and how to safely purge these events.

<!-- truncate -->

## What are Keycloak User Events?

Keycloak user events are records of significant actions taken by users within a realm. These events can include (but are not limited to):

- **Login attempts**: Successful and failed login attempts.
- **Account management**: Actions like password changes, profile updates, and account deletions.
- **Session management**: Events related to session creation, termination, and expiration. Including token refreshes.

For more about event metric observability, see the [Keycloak documentation on events](https://www.keycloak.org/docs/latest/server_admin/#configuring-auditing-to-track-events).

Also, we're speaking about user events, but admin events are also tracked in Keycloak. These are actions taken by administrators, such as creating or deleting users, managing roles, and configuring realms. Similar principles apply to admin events.

## Why Track User Events?

Tracking user events can be useful for several reasons:

- **Monitoring**: Understanding user behavior and system performance by tracking number of logins, failed attempts, token refreshes, etc.
- **Exporting**: Exporting user events to external systems for further analysis or reporting. This can include creating dashboards or alerts based on user activity.
- **Auditing**: Maintaining a record of user actions for compliance and security purposes.

One item of note, if you are running a Keycloak cluster, user events need to be collected from all instances to get a per cluster view.

## How Long Should User Events Be Retained?

The configuration for user event retention is set in the Keycloak admin console under the `Realm Settings > Events > User events settings`. Make sure that "Save events" is toggled to "On" and then in the expiration section, you can set the retention period for user events.

We recommend setting a reasonable retention period based on your application's needs. For example, you might choose to retain user events for 30 days, 90 days, or longer, depending on your compliance requirements and the volume of user activity. If you have a lot of user activity, you may want to set a shorter retention period to avoid performance issues.

Keycloak will save these events in the database, and if you have a high volume of user activity, this can lead to a large number of records over time. This can impact the performance of your Keycloak instance, especially when querying or managing these events. Exporting events on a periodic basis to back up or use in external systems not only helps with performance but also allows you to keep a historical record of user activity.

## How to Purge User Events

There are two ways to purge user events in Keycloak in the Admin UI:

1. Hit a big red button in the admin console that says "Clear user events".
2. Change the retention period to a shorter time frame, which will automatically purge events older than the new retention period.

The thing is, those options are much to easy to hit and lead to unintended consequences. Clicking a button or changing a setting can lead to a large number of events being purged at once, which can cause performance issues or even downtime in your Keycloak instance. This effectively locks up the database and can lead to massive latency issues for you and your users.

## Considerations Before Purging User Events

Before purging user events, consider the following:

1. **How many events are currently stored?** If you have a large number of events, purging them can take some time and may impact performance during the operation.
2. **What is the current retention period?** If you have a long retention period set, you may want to consider shortening it before purging to avoid performance issues in the future.
3. **What is the impact on auditing and monitoring?** Purging user events will remove historical data, so consider how this will affect your ability to monitor user activity and maintain compliance.
4. **Backup your data**: If you need to keep a record of user events for compliance or auditing purposes, consider exporting the events to an external system before purging them. This way, you can retain a historical record of user activity without impacting the performance of your Keycloak instance.

With that in mind, the Admin UI provides some really safe and unguarded ways to just "push a button" and introduce almost immediate performance issues.

So what should you do?

## Safe Steps to Purge User Events

If you have a large number of user events and need to purge them safely, the only real way to do this is to create a manual script that will purge the events in small batches. This way, you can avoid locking up the database and causing performance issues.

Another option is to slowly pull in the retention period over time. For example, if you have a retention period of 365 days, you can change it to 180 days and then wait a few days before changing it to 90 days. This will allow Keycloak to purge events in smaller batches and hopefully avoid performance issues.

In addition, to avoid Admin UI click-ops oopsies, ensure that users with access to the Admin UI do not have permissions to `manage-events`. This will prevent them from accidentally purging user events through the UI.

## Keep Event Lifetime Low, Send to a 3rd Party System

One other option to consider is to keep the event lifetime low and send the events to a third-party system for long-term storage and analysis. This can be done by configuring Keycloak to export user events to an external system, such as a logging service or a data warehouse. Doing the actual configuration though, is not native to Keycloak and requires an extension.

Using the Phase Two [Events Extension](https://github.com/p2-inc/keycloak-events), this can be accomplished rather easily. By adding configuration to the `EventListenerProvider` it is possible to send the events to a specified URI (and optionally sign with keyed-HMAC). The extension provides a handful of options including webhooks and retry logic with exponential backoff.

## Conclusion

Purging user events in Keycloak is an important task to maintain performance and manageability, especially for high-traffic installations. By understanding the implications of user event retention and following safe practices for purging, you can ensure that your Keycloak instance remains responsive and efficient.

If you have any questions or need assistance with purging user events, feel free to reach out to the Phase Two support team at [support@phasetwo.io](mailto:support@phasetwo.io). We’re here to help you manage your Keycloak resources effectively and ensure your deployment runs smoothly.
