---
id: django
title: Django
---

The following could be applied to an existing Django application, but we have chosen to use the excellent tutorial application built by [Mozilla](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django) as our example. If you aren't yet familiar with Django, we encourage you to follow the tutorial there.

The completed code for that tutorial is available in their GitHub repository. We'll clone it to get started.

A full [Django example](https://github.com/p2-inc/examples/tree/main/frameworks/django) is available.

## Quick Start

To get this project up and running locally on your computer:

1. Set up the [Python development environment](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/development_environment).
   We recommend using a Python virtual environment.
1. Assuming you have Python setup, run the following commands (if you're on Windows you may use `py` or `py -3` instead of `python` to start Python):
   ```
   pip install -r requirements.txt
   python manage.py makemigrations
   python manage.py migrate
   python manage.py collectstatic
   python manage.py test # Run the standard tests. These should all pass.
   python manage.py createsuperuser # Create a superuser
   python manage.py runserver
   ```
1. Open a browser to `http://127.0.0.1:8000/admin/` to open the admin site
1. Create a few test objects of each type.
1. Open tab to `http://127.0.0.1:8000` to see the main site, with your new objects.

## Install and configure the Django OIDC library

Now that we've installed and configured Keycloak, we need to setup Django to replace the native authentication method provided by the framework. The first task is to install a library that is compatible with Keycloak's OIDC implementation.

The [mozilla-django-oidc](https://mozilla-django-oidc.readthedocs.io/) library provides an easy way to integrate Keycloak (or any OpenID Connect-compliant identity provider) with your Django app. It abstracts many of the complexities of integrating authentication and authorization. Here's how you can set it up:

1. **Install the Package**:
   Install the `mozilla-django-oidc` package using pip:

   ```bash
   pip install mozilla-django-oidc
   ```

2. **Configure Django Settings**:
   Update your Django app's `settings.py` to include the necessary configurations for `mozilla-django-oidc`:

   ```python
   INSTALLED_APPS = [
       # ...
       'django.contrib.auth',
       'mozilla_django_oidc',  # Load after django.contrib.auth
       # ...
   ]

   AUTHENTICATION_BACKENDS = (
       'mozilla_django_oidc.auth.OIDCAuthenticationBackend',
       # ...
   )

   OIDC_RP_CLIENT_ID = 'your-client-id'
   OIDC_RP_CLIENT_SECRET = 'your-client-secret'
   OIDC_OP_AUTHORIZATION_ENDPOINT = 'https://keycloak-url/auth/realms/your-realm/protocol/openid-connect/auth'
   OIDC_OP_TOKEN_ENDPOINT = 'https://keycloak-url/auth/realms/your-realm/protocol/openid-connect/token'
   OIDC_OP_USER_ENDPOINT = 'https://keycloak-url/auth/realms/your-realm/protocol/openid-connect/userinfo'
   OIDC_OP_JWKS_ENDPOINT = 'https://keycloak-url/auth/realms/your-realm/protocol/openid-connect/certs'
   OIDC_RP_SIGN_ALGO = 'RS256'

   LOGIN_URL = 'oidc_authentication_init'
   LOGOUT_REDIRECT_URL = '/'
   LOGIN_REDIRECT_URL = '/'
   ```

   Replace `your-client-id`, `your-client-secret`, and the Keycloak URLs with your actual Keycloak configurations.

3. **Add URLs**:
   Update your Django app's `urls.py` to include the authentication URLs provided by `mozilla-django-oidc`:

   ```python
   urlpatterns += [
       path('oidc/', include('mozilla_django_oidc.urls')),
   ]
   ```

## Using it in your app

### Protect your views

Use Decorators for Access Control. You can now use the `@oidc_protected` decorator to protect views that require authentication and potentially specific roles:

```python
from mozilla_django_oidc.decorators import oidc_protected

@oidc_protected
def protected_view(request):
    # Your view logic
```

### Accessing user information

You can access user information after authentication using the `request.oidc_user` attribute. For example:

```python
def profile_view(request):
    user_info = request.oidc_user.userinfo
    # Access user_info['sub'], user_info['email'], etc.
    # Your view logic
```

By default, `mozilla-django-oidc` looks up a Django user matching the email field to the email address returned in the user info data from Keycloak.

If a user logs into your site and doesn’t already have an account, by default, `mozilla-django-oidc` will create a new Django user account. It will create the User instance filling in the username (hash of the email address) and email fields.

#### Use Username rather than Email

`mozilla-django-oidc` defaults to setting up Django users using the email address as the user name from keycloak was required. Fortunately, `preferred_username` is set up by default in Keycloak as a claim. The claim can used by overriding the `OIDCAuthenticationBackend` class in `mozilla_django_oidc.auth` and referring to this in `AUTHENTICATION_BACKENDS` as below:

```python

# Classes to override default OIDCAuthenticationBackend (Keycloak authentication)
from mozilla_django_oidc.auth import OIDCAuthenticationBackend

class KeycloakOIDCAuthenticationBackend(OIDCAuthenticationBackend):

 def create_user(self, claims):
     """ Overrides Authentication Backend so that Django users are
         created with the keycloak preferred_username.
         If nothing found matching the email, then try the username.
     """
     user = super(KeycloakOIDCAuthenticationBackend, self).create_user(claims)
     user.first_name = claims.get('given_name', '')
     user.last_name = claims.get('family_name', '')
     user.email = claims.get('email')
     user.username = claims.get('preferred_username')
     user.save()
     return user

 def filter_users_by_claims(self, claims):
     """ Return all users matching the specified email.
         If nothing found matching the email, then try the username
     """
     email = claims.get('email')
     preferred_username = claims.get('preferred_username')

     if not email:
         return self.UserModel.objects.none()
     users = self.UserModel.objects.filter(email__iexact=email)

     if len(users) < 1:
         if not preferred_username:
             return self.UserModel.objects.none()
         users = self.UserModel.objects.filter(username__iexact=preferred_username)
     return users

 def update_user(self, user, claims):
     user.first_name = claims.get('given_name', '')
     user.last_name = claims.get('family_name', '')
     user.email = claims.get('email')
     user.username = claims.get('preferred_username')
     user.save()
     return user
```

In settings.py, overide the new library you have just added in AUTHENTICATION_BACKENDS :

```python
 # mozilla_django_oidc - Keycloak authentication
 "fragalysis.auth.KeycloakOIDCAuthenticationBackend",
```

### Logging out

You can use the `@oidc_logout` decorator to log the user out of both your app and Keycloak:

```python
from mozilla_django_oidc.decorators import oidc_logout

@oidc_logout
def logout_view(request):
    # Your logout view logic
```

## Add support for Django Rest Framework

Django Rest Framework (DRF) is a flexible toolkit built on top of Django, specifically designed for building RESTful APIs.

If you want DRF to authenticate users based on an OAuth access token provided in the Authorization header, you can use the DRF-specific authentication class which ships with the package.

Add this to your settings:

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'mozilla_django_oidc.contrib.drf.OIDCAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        # other authentication classes, if needed
    ],
}
```

Note that this only takes care of authenticating against an access token, and provides no options to create or renew tokens.

If you’ve created a custom Django OIDCAuthenticationBackend and added that to your AUTHENTICATION_BACKENDS, the DRF class should be smart enough to figure that out. Alternatively, you can manually set the OIDC backend to use:

```python
OIDC_DRF_AUTH_BACKEND = 'mozilla_django_oidc.auth.OIDCAuthenticationBackend'
```
