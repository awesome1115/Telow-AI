-- Table: public.openai_assistants

-- DROP TABLE IF EXISTS public.openai_assistants;

CREATE TABLE IF NOT EXISTS public.openai_assistants
(
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    assistant json NOT NULL,
    instance_id uuid NOT NULL,
    user_id text COLLATE pg_catalog."default",
    thread json,
    messages json,
    CONSTRAINT openai_assistants_pkey PRIMARY KEY (id),
    CONSTRAINT openai_assistants_instance_id_fkey FOREIGN KEY (instance_id)
        REFERENCES public.instances (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT openai_assistants_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.authorizer_users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)