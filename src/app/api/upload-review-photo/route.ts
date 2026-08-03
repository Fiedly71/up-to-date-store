import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Endpoint public (pas de session requise, un client anonyme doit pouvoir
// joindre une photo à son avis) — donc restrictions strictes : uniquement
// des images, taille limitée. ⚠️ Un endpoint d'upload public reste un
// vecteur d'abus possible (hébergement de contenu non lié aux avis) ; à
// surveiller, voir PROGRESS.md.
export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Upload de photo non configuré pour l'instant." },
      { status: 501 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
  }
  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "Image trop lourde (max 3 Mo)." }, { status: 400 });
  }

  const blob = await put(`review-photos/${Date.now()}-${file.name}`, file, { access: "public" });
  return NextResponse.json({ url: blob.url });
}
