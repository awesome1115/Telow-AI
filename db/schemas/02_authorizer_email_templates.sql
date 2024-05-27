-- Table: public.authorizer_email_templates

-- DROP TABLE IF EXISTS public.authorizer_email_templates;

CREATE TABLE IF NOT EXISTS public.authorizer_email_templates
(
    key text COLLATE pg_catalog."default",
    id character(36) COLLATE pg_catalog."default" NOT NULL,
    event_name text COLLATE pg_catalog."default",
    subject text COLLATE pg_catalog."default",
    template text COLLATE pg_catalog."default",
    design text COLLATE pg_catalog."default",
    created_at bigint,
    updated_at bigint,
    CONSTRAINT authorizer_email_templates_pkey PRIMARY KEY (id),
    CONSTRAINT authorizer_email_templates_event_name_key UNIQUE (event_name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.authorizer_email_templates
    OWNER to postgres;

GRANT ALL ON TABLE public.authorizer_email_templates TO postgres;