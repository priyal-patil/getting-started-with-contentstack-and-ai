import { revalidatePath } from "next/cache";

/**
 * Verifies the webhook using CONTENTSTACK_WEBHOOK_SECRET.
 * Supports: `Authorization: Bearer <secret>` or `X-Webhook-Secret: <secret>`.
 */
function verifyWebhookSecret(request, expectedSecret) {
  if (!expectedSecret) return false;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    if (token === expectedSecret) return true;
  }

  const headerSecret = request.headers.get("x-webhook-secret");
  if (headerSecret && headerSecret === expectedSecret) return true;

  return false;
}

/**
 * Resolves `blog_post` entry payload from common Contentstack webhook shapes.
 */
function getBlogPostInfo(body) {
  const contentTypeUid =
    body?.data?.content_type?.uid ??
    body?.content_type?.uid ??
    body?.content_type_uid;

  const entry = body?.data?.entry ?? body?.entry;

  const slug = entry && typeof entry.slug === "string" ? entry.slug : null;

  return { contentTypeUid, slug, entry };
}

export async function POST(request) {
  const secret = process.env.CONTENTSTACK_WEBHOOK_SECRET;

  if (!secret) {
    return Response.json(
      { message: "CONTENTSTACK_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (!verifyWebhookSecret(request, secret)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { contentTypeUid, slug } = getBlogPostInfo(body);

  if (contentTypeUid !== "blog_post") {
    return Response.json(
      { message: "Ignored: not blog_post", contentTypeUid: contentTypeUid ?? null },
      { status: 200 }
    );
  }

  const paths = ["/blog"];
  revalidatePath("/blog");

  if (slug) {
    const postPath = `/blog/${slug}`;
    paths.push(postPath);
    revalidatePath(postPath);
  }

  return Response.json({
    revalidated: true,
    paths,
  });
}

export async function GET() {
  return Response.json({ message: "Method Not Allowed" }, { status: 405 });
}
