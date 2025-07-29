---
id: brute-force-detection
title: Brute Force Detection
---

Keycloak provides a brute force detection feature that can help protect your realm from malicious login attempts. This feature is not enabled by default, so you will need to configure it according to your security requirements.

Brute force attacks are attempts to guess a user's password by trying many different combinations. Keycloak can detect these attempts and take actions such as temporarily disabling the user account when the threshold of failed login attempts is reached.

1. Log in to the Keycloak Admin Console via the Phase Two Dashboard.
2. Visit the realm you want to configure. Open the console link for the specific realm.
3. Navigate to the **Realm settings** section in the left sidebar.
4. Click on the **Security defenses** tab and then select the **Brute Force Detection** sub-tab.
5. In the **Brute Force Mode** dropdown, select your desired mode:
   - **Disabled**: No brute force detection is applied.
   - **Lockout permanently**: User accounts will be permanently locked after the threshold of failed login attempts is reached.
   - **Lockout temporarily**: User accounts will be temporarily locked for a specified duration after the threshold of failed login attempts is reached.
   - **Lockout permanently after temporary lockout**: User accounts will be permanently locked after a temporary lockout period if the threshold is reached again.

<figure>
  <img src="/docs/security/brute-force-detection-mode-select.png" className="max-w-xl"  alt="Brute force detection mode selection" />
  <figcaption>Brute force detection mode selection</figcaption>
</figure>

6. Set your desired thresholds to be reached.

<figure>
<img src="/docs/security/brute-force-detection-mode-configuration.png" className="max-w-xl"  alt="Brute force detection mode configuration" />
<figcaption>Brute force detection mode configuration</figcaption>
</figure>

## Considerations

Brute Force Detection is limited to one specific user. It will not detect brute force attacks across multiple users or accounts. If you have a large number of users, consider implementing additional security measures such as IP allow/deny lists, rate limiting, or using a Web Application Firewall (WAF) to protect against brute force attacks.

If you need assistance with configuring a WAF or have specific security requirements, please [contact support](/contact).
