-- Table: public.authorizer_verification_requests

-- DROP TABLE IF EXISTS public.authorizer_verification_requests;

CREATE TABLE IF NOT EXISTS public.authorizer_verification_requests
(
    key text COLLATE pg_catalog."default",
    id character(36) COLLATE pg_catalog."default" NOT NULL,
    token text COLLATE pg_catalog."default",
    identifier character varying(64) COLLATE pg_catalog."default",
    expires_at bigint,
    email character varying(256) COLLATE pg_catalog."default",
    nonce text COLLATE pg_catalog."default",
    redirect_uri text COLLATE pg_catalog."default",
    created_at bigint,
    updated_at bigint,
    CONSTRAINT authorizer_verification_requests_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.authorizer_verification_requests
    OWNER to postgres;

GRANT ALL ON TABLE public.authorizer_verification_requests TO postgres;
-- Index: idx_email_identifier

-- DROP INDEX IF EXISTS public.idx_email_identifier;

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_identifier
    ON public.authorizer_verification_requests USING btree
    (identifier COLLATE pg_catalog."default" ASC NULLS LAST, email COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;