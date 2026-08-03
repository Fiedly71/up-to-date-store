// Champ "honeypot" anti-spam : visuellement masqué (mais présent dans le
// DOM, pas display:none — certains bots ignorent display:none) et retiré
// de la navigation clavier/lecteur d'écran. Un humain ne le remplit
// jamais ; un bot qui remplit tous les champs le fera. Le serveur rejette
// silencieusement toute soumission où ce champ n'est pas vide.
export function Honeypot() {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden"
    />
  );
}
