-- Table: public.authorizer_authenticators

-- DROP TABLE IF EXISTS public.authorizer_authenticators;

CREATE TABLE IF NOT EXISTS public.authorizer_authenticators
(
    key text COLLATE pg_catalog."default",
    id character(36) COLLATE pg_catalog."default" NOT NULL,
    user_id character(36) COLLATE pg_catalog."default",
    method text COLLATE pg_catalog."default",
    secret text COLLATE pg_catalog."default",
    recovery_codes text COLLATE pg_catalog."default",
    verified_at bigint,
    created_at bigint,
    updated_at bigint,
    CONSTRAINT authorizer_authenticators_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.authorizer_authenticators
    OWNER to postgres;

GRANT ALL ON TABLE public.authorizer_authenticators TO postgres;