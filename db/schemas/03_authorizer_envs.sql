-- Table: public.authorizer_envs

-- DROP TABLE IF EXISTS public.authorizer_envs;

CREATE TABLE IF NOT EXISTS public.authorizer_envs
(
    key text COLLATE pg_catalog."default",
    id character(36) COLLATE pg_catalog."default" NOT NULL,
    env_data text COLLATE pg_catalog."default",
    hash text COLLATE pg_catalog."default",
    encryption_key text COLLATE pg_catalog."default",
    updated_at bigint,
    created_at bigint,
    CONSTRAINT authorizer_envs_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.authorizer_envs
    OWNER to postgres;

GRANT ALL ON TABLE public.authorizer_envs TO postgres;