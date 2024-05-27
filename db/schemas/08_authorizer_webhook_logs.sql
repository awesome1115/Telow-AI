-- Table: public.authorizer_webhook_logs

-- DROP TABLE IF EXISTS public.authorizer_webhook_logs;

CREATE TABLE IF NOT EXISTS public.authorizer_webhook_logs
(
    key text COLLATE pg_catalog."default",
    id character(36) COLLATE pg_catalog."default" NOT NULL,
    http_status bigint,
    response text COLLATE pg_catalog."default",
    request text COLLATE pg_catalog."default",
    webhook_id character(36) COLLATE pg_catalog."default",
    created_at bigint,
    updated_at bigint,
    CONSTRAINT authorizer_webhook_logs_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.authorizer_webhook_logs
    OWNER to postgres;

GRANT ALL ON TABLE public.authorizer_webhook_logs TO postgres;