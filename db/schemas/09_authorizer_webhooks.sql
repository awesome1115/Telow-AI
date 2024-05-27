-- Table: public.authorizer_webhooks

-- DROP TABLE IF EXISTS public.authorizer_webhooks;

CREATE TABLE IF NOT EXISTS public.authorizer_webhooks
(
    key text COLLATE pg_catalog."default",
    id character(36) COLLATE pg_catalog."default" NOT NULL,
    event_name text COLLATE pg_catalog."default",
    event_description text COLLATE pg_catalog."default",
    end_point text COLLATE pg_catalog."default",
    headers text COLLATE pg_catalog."default",
    enabled boolean,
    created_at bigint,
    updated_at bigint,
    CONSTRAINT authorizer_webhooks_pkey PRIMARY KEY (id),
    CONSTRAINT authorizer_webhooks_event_name_key UNIQUE (event_name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.authorizer_webhooks
    OWNER to postgres;

GRANT ALL ON TABLE public.authorizer_webhooks TO postgres;