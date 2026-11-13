-- Prepared only. Not applied. Activate Cloud and wire an explicitly consented write before use.
-- Never collect email automatically or include it in share links or analytics.
CREATE TABLE public.anonymous_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  assessment jsonb NOT NULL,
  meteor_score integer NOT NULL CHECK (meteor_score BETWEEN 0 AND 100)
);
GRANT ALL ON public.anonymous_results TO service_role;
ALTER TABLE public.anonymous_results ENABLE ROW LEVEL SECURITY;
-- No public access. Future verified server handlers perform opt-in writes.
CREATE TABLE public.autopsy_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL CHECK (length(email) <= 320),
  consented_at timestamptz NOT NULL,
  result_id uuid REFERENCES public.anonymous_results(id)
);
GRANT ALL ON public.autopsy_leads TO service_role;
ALTER TABLE public.autopsy_leads ENABLE ROW LEVEL SECURITY;
-- No public reads or writes; enable only after adding a consented, validated handler.