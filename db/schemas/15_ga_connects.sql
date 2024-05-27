-- Table: public.ga_connects

-- DROP TABLE IF EXISTS public.ga_connects;
CREATE SEQUENCE IF NOT EXISTS public.ga_connects_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.ga_connects
(
    id integer NOT NULL DEFAULT nextval('ga_connects_id_seq'::regclass),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    refresh_token text COLLATE pg_catalog."default",
    user_id text COLLATE pg_catalog."default" NOT NULL,
    instance_id uuid NOT NULL,
    view_id text COLLATE pg_catalog."default",
    code text COLLATE pg_catalog."default",
    CONSTRAINT ga_connects_pkey PRIMARY KEY (id),
    CONSTRAINT ga_connects_instance_id_key UNIQUE (instance_id),
    CONSTRAINT ga_connects_instance_id_fkey FOREIGN KEY (instance_id)
        REFERENCES public.instances (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT ga_connects_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.authorizer_users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
