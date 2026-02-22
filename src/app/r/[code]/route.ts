// app/r/[code]/route.ts  (o src/app/r/[code]/route.ts según tu setup)
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getOrigin(req: NextRequest) {
  // OJO: en prod detrás de proxy vienen estos headers
  const xfProto = req.headers.get("x-forwarded-proto");
  const xfProtocol = req.headers.get("x-forwarded-protocol");
  const xfHost = req.headers.get("x-forwarded-host");
  const host = req.headers.get("host");

  // nextUrl.protocol puede venir "https:" => le saco los dos puntos
  const protoGuess = req.nextUrl?.protocol?.replace(/:$/, "");

  const proto = (xfProto || xfProtocol || protoGuess || "https").replace(
    /:$/,
    ""
  );
  const usedHost = xfHost || host || "www.fstickets.app";

  const origin = `${proto}://${usedHost}`;
  return origin;
}

function buildApiBase() {
  const prod = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  const dev = (process.env.NEXT_PUBLIC_API_DEV_URL || "").trim();
  const resolved = (prod || dev || "").replace(/\/+$/, "");

  console.log("[/r/[code]] buildApiBase() ::", {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_DEV_URL: process.env.NEXT_PUBLIC_API_DEV_URL,
    resolvedBase: resolved || null,
  });

  return resolved || null;
}

export async function GET(req: NextRequest, ctx: { params: { code: string } }) {
  // Para ver todo el request entrante
  try {
    const code = String(ctx?.params?.code || "")
      .trim()
      .toUpperCase();

    const origin = getOrigin(req);

    if (!code) {
      return NextResponse.redirect(new URL("/", origin), 302);
    }

    const apiBase = buildApiBase();
    if (!apiBase) {
      return NextResponse.redirect(new URL("/", origin), 302);
    }

    const backURL = `${apiBase}/rrpp/resolve-code/${encodeURIComponent(code)}`;

    const res = await fetch(backURL, {
      method: "GET",
      cache: "no-store",
    }).catch((e) => {
      return null;
    });

    if (!res) {
      return NextResponse.redirect(new URL("/", origin), 302);
    }

    console.log("[/r/[code]] BACK status ::", res.status, res.statusText);

    if (!res.ok) {
      return NextResponse.redirect(new URL("/", origin), 302);
    }

    // Intento parsear JSON y además lo logueo crudo por si rompe
    const raw = await res.text();

    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return NextResponse.redirect(new URL("/", origin), 302);
    }

    // FLEX: acepto varias formas por si el back cambia claves
    const eventId = data?.eventId || data?.event?.id || data?.e || data?.evtId;
    const token = data?.token || data?.jwt || data?.t;

    if (!eventId || !token) {
      return NextResponse.redirect(new URL("/", origin), 302);
    }

    const target = new URL(`/events/${encodeURIComponent(eventId)}`, origin);
    target.searchParams.set("token", String(token));

    // A veces ayuda 307/308 si hay problemas con proxies; probamos 302 primero:
    return NextResponse.redirect(target, 302);
  } catch (e) {
    const origin = getOrigin(req);
    return NextResponse.redirect(new URL("/", origin), 302);
  }
}
