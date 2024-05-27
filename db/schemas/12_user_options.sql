-- Table: public.user_options

-- DROP TABLE IF EXISTS public.user_options;

CREATE TABLE IF NOT EXISTS public.user_options
(
    user_id text COLLATE pg_catalog."default" NOT NULL,
    "openAI" text COLLATE pg_catalog."default",
    "stripeId" text COLLATE pg_catalog."default",
    "openAI_version" text COLLATE pg_catalog."default" DEFAULT 'gpt-3.5-turbo'::text,
    CONSTRAINT user_options_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_options_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.authorizer_users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)