-- Table: public.bugs

-- DROP TABLE IF EXISTS public.bugs;

-- Create sequence for auto-incrementing primary key
CREATE SEQUENCE IF NOT EXISTS public.bugs_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.bugs
(
    id integer NOT NULL DEFAULT nextval('bugs_id_seq'::regclass),
    domain text COLLATE pg_catalog."default" NOT NULL,
    message text COLLATE pg_catalog."default" NOT NULL,
    url text COLLATE pg_catalog."default" NOT NULL,
    type text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    instance_id uuid NOT NULL,
    language text COLLATE pg_catalog."default" NOT NULL,
    resolved boolean,
    error_code text COLLATE pg_catalog."default" NOT NULL,
    note text COLLATE pg_catalog."default",
    CONSTRAINT bugs_pkey PRIMARY KEY (id),
    CONSTRAINT bugs_instance_id_fkey FOREIGN KEY (instance_id)
        REFERENCES public.instances (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)