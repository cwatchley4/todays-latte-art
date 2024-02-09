import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ahzvwcyggypskspkfozy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoenZ3Y3lnZ3lwc2tzcGtmb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDczMzMyMzgsImV4cCI6MjAyMjkwOTIzOH0.WTdYCGaE2I2bruy8TawS2FGP-NLhqEeQt830cDQ4mxs",
  {
    storageBucket: "art-images",
  }
);

export default supabase;
