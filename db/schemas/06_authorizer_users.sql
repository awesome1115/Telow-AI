-- Table: public.authorizer_users

-- DROP TABLE IF EXISTS public.authorizer_users;

CREATE TABLE IF NOT EXISTS public.authorizer_users
(
    key text COLLATE pg_catalog."default",
    id character(36) COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default",
    email_verified_at bigint,
    password text COLLATE pg_catalog."default",
    signup_methods text COLLATE pg_catalog."default",
    given_name text COLLATE pg_catalog."default",
    family_name text COLLATE pg_catalog."default",
    middle_name text COLLATE pg_catalog."default",
    nickname text COLLATE pg_catalog."default",
    gender text COLLATE pg_catalog."default",
    birthdate text COLLATE pg_catalog."default",
    phone_number text COLLATE pg_catalog."default",
    phone_number_verified_at bigint,
    picture text COLLATE pg_catalog."default",
    roles text COLLATE pg_catalog."default",
    revoked_timestamp bigint,
    is_multi_factor_auth_enabled boolean,
    updated_at bigint,
    created_at bigint,
    app_data text COLLATE pg_catalog."default",
    CONSTRAINT authorizer_users_pkey PRIMARY KEY (id),
    CONSTRAINT authorizer_users_email_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.authorizer_users
    OWNER to postgres;

GRANT ALL ON TABLE public.authorizer_users TO postgres;
-- Index: idx_authorizer_users_phone_number

-- DROP INDEX IF EXISTS public.idx_authorizer_users_phone_number;

CREATE INDEX IF NOT EXISTS idx_authorizer_users_phone_number
    ON public.authorizer_users USING btree
    (phone_number COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;