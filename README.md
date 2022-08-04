# Angular Forms

Typed forms and then some

## Getting started

In order to be able to publish the NPM package you will need to add your GitLab API token (API Access) via the following command

```cmd
yarn config set -H "npmRegistries[\"//gitlab.com/api/v4/projects/37055767/packages/npm/\"].npmAuthToken" $AUTH_TOKEN$
```

Where `$AUTH_TOKEN$` is your GitLab API token

You will also need to add the following for package download:

```cmd
yarn config set -H "npmRegistries[\"//gitlab.com/api/v4/packages/npm/\"].npmAuthToken" $AUTH_TOKEN$
```
