---
id: password-blacklist
title: Password Blacklist
---

Keycloak provides an easy method to add a password blacklist to your realm. This is useful for preventing users from choosing common or compromised passwords. If you don't have a password blacklist, you can use the one provided by [Have I Been Pwned](https://haveibeenpwned.com/Passwords).

For subscribers of a dedicated cluster, contact support to enable to upload your list.

Enabling the password blacklist is done in the Keycloak Admin Console:

1. Log in to the Keycloak Admin Console via the Phase Two Dashboard.
2. Visit the realm you want to configure. Open the console link for the specific realm.
3. Navigate to the **Authentication** section in the left sidebar.
4. Click on the **Policies** tab and in the dropdown select **Password Blacklist**.
5. Provide the name of the file. Click "Save" to designate the file.

<figure>
  <img src="/docs/security/password-policy.png" className="max-w-xl"  alt="Phase Two Team Details View" />
  <figcaption>Policies > Password Policy</figcaption>
</figure>
