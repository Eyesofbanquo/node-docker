# Avon

![Qizzo](./.github/resources/logo.png)

> You only do two days no how. That's the day you go in, and the day you come out.

***

### Table of contents

1. [Description](#description)
2. [Environment Variables](#env)
3. [Random](#random)

### <a name="description"></a>Description

This `microservice` is to be used along with the `Qizzo` quiz service and `Qizzo` client apps.


### <a name="env"></a>Environment Variables

The following variables need to be set inside your `.env` file.

1. `DATABASE_NAME`
    * This environment variable is used for setting what the database name should be.
2. `DATABAUSE_URL`
    * This is the **full** URI needed to connect to the `postgres` database without needing to type in a password.
3. `JWT_SECRET` & `JWT_REFRESH_SECRET`
    * This variable should be set using a randomly generated string from the following website.
    > https://www.grc.com/passwords.htm
4. `POSTGRES_USER`
    * This is needed for `docker-compose`.
5. `POSTGRES_PASSWORD`
    * This is needed for `docker-compose`.
