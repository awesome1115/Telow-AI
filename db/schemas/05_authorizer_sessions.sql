-- Table: public.authorizer_sessions

-- DROP TABLE IF EXISTS public.authorizer_sessions;

CREATE TABLE IF NOT EXISTS public.authorizer_sessions
(
    key text COLLATE pg_catalog."default",
    id character(36) COLLATE pg_catalog."default" NOT NULL,
    user_id character(36) COLLATE pg_catalog."default",
    user_agent text COLLATE pg_catalog."default",
    ip text COLLATE pg_catalog."default",
    created_at bigint,
    updated_at bigint,
    CONSTRAINT authorizer_sessions_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.authorizer_sessions
    OWNER to postgres;

GRANT ALL ON TABLE public.authorizer_sessions TO postgres;