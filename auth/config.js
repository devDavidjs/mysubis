// Configuration publique des pages d'authentification (même valeurs que l'app).
// La clé « anon » est publique par conception (elle est déjà dans l'app) : les données restent
// protégées par les règles RLS de Supabase. Ne JAMAIS mettre ici la clé service_role.
window.MYSUBIS_AUTH_CONFIG = Object.freeze({
  url: "https://ozfxhosqbnwaicwtekuk.supabase.co",
  anonKey: "sb_publishable_9UoD8AExYVvlMgfSrFti4A_HIiOFFMC",
});
