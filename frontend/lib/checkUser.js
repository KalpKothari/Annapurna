import { auth, currentUser } from "@clerk/nextjs/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  if (!STRAPI_API_TOKEN) {
    console.error("❌ STRAPI_API_TOKEN missing");
    return null;
  }

   // Check if user has Pro plan
  const { has } = await auth();
  const subscriptionTier = has({ plan: "pro" }) ? "pro" : "free";
  const email = user.emailAddresses[0].emailAddress;

  try {
    // 🔹 Fetch all users
    const usersRes = await fetch(`${STRAPI_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!usersRes.ok) {
      console.error(await usersRes.text());
      return null;
    }

    const users = await usersRes.json();

    // 🔹 Match by clerkId OR email
    let existingUser = users.find(
      u => u.clerkId === user.id || u.email === email
    );

    // ✅ USER EXISTS → UPDATE clerkId if missing
    if (existingUser) {
      const updates = {};

      if (!existingUser.clerkId) {
        updates.clerkId = user.id;
      }

      if (existingUser.subscriptionTier !== subscriptionTier) {
        updates.subscriptionTier = subscriptionTier;
      }

      if (Object.keys(updates).length > 0) {
        await fetch(`${STRAPI_URL}/api/users/${existingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          },
          body: JSON.stringify(updates),
        });
      }

      return { ...existingUser, ...updates };
    }

    // 🔹 Get authenticated role
    const rolesRes = await fetch(
      `${STRAPI_URL}/api/users-permissions/roles`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      }
    );

    const rolesData = await rolesRes.json();
    const authenticatedRole = rolesData.roles.find(
      r => r.type === "authenticated"
    );

    if (!authenticatedRole) {
      console.error("❌ Authenticated role not found");
      return null;
    }

    // 🆕 CREATE USER (ONLY WHEN SAFE)
    const createRes = await fetch(`${STRAPI_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        username: user.username || email.split("@")[0],
        email,
        password: `clerk_${user.id}_${Date.now()}`,
        confirmed: true,
        blocked: false,
        role: authenticatedRole.id,
        clerkId: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl || "",
        subscriptionTier,
      }),
    });

    if (!createRes.ok) {
      console.error(await createRes.text());
      return null;
    }

    return await createRes.json();
  } catch (err) {
    console.error("❌ checkUser error:", err);
    return null;
  }
};
