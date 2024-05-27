-- Table: public.authorizer_otps

-- DROP TABLE IF EXISTS public.authorizer_otps;

CREATE TABLE IF NOT EXISTS public.authorizer_otps
(
    key text COLLATE pg_catalog."default",
    id character(36) COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default",
    phone_number text COLLATE pg_catalog."default",
    otp text COLLATE pg_catalog."default",
    expires_at bigint,
    created_at bigint,
    updated_at bigint,
    CONSTRAINT authorizer_otps_pkey PRIMARY KEY (id),
    CONSTRAINT authorizer_otps_email_key UNIQUE (email),
    CONSTRAINT idx_authorizer_otps_phone_number UNIQUE (phone_number)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.authorizer_otps
    OWNER to postgres;

GRANT ALL ON TABLE public.authorizer_otps TO postgres;
-- Index: unique_index_phone_number

-- DROP INDEX IF EXISTS public.unique_index_phone_number;

CREATE UNIQUE INDEX IF NOT EXISTS unique_index_phone_number
    ON public.authorizer_otps USING btree
    (phone_number COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;