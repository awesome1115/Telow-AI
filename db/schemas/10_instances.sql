-- Table: public.instances

-- DROP TABLE IF EXISTS public.instances;

CREATE TABLE IF NOT EXISTS public.instances
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    domain_screenshot text COLLATE pg_catalog."default" NOT NULL,
    user_id text COLLATE pg_catalog."default" NOT NULL,
    domain text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    subscription_id text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default" NOT NULL DEFAULT 'active'::text,
    CONSTRAINT "Instances_pkey" PRIMARY KEY (id),
    CONSTRAINT "Instances_user_id_fkey" FOREIGN KEY (user_id)
        REFERENCES public.authorizer_users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
