import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mapUserRow(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,
    confirmed: user.confirmed,
    blocked: user.blocked,
    role: user.role_id,
    clerkId: user.clerk_id,
    firstName: user.first_name,
    lastName: user.last_name,
    imageUrl: user.image_url,
    subscriptionTier: user.subscription_tier,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

async function getCurrentUserWithRetry(attempts = 3, delayMs = 200) {
  for (let i = 0; i < attempts; i++) {
    const user = await currentUser();
    if (user) return user;

    const isLastAttempt = i === attempts - 1;
    if (!isLastAttempt) {
      await sleep(delayMs);
    }
  }

  return null;
}

async function findUserByClerkOrEmail(supabaseAdmin, clerkId, email) {
  const { data: byClerkId, error: byClerkIdError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (byClerkIdError) {
    throw byClerkIdError;
  }

  if (byClerkId) {
    return byClerkId;
  }

  const { data: byEmail, error: byEmailError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (byEmailError) {
    throw byEmailError;
  }

  return byEmail || null;
}

export const checkUser = async () => {
  const { userId, has, sessionClaims } = await auth();
  if (!userId) {
    console.warn("No Clerk user found");
    return null;
  }

  const user = await getCurrentUserWithRetry();
  const clerkSubscriptionTier = has({ plan: "pro" }) ? "pro" : "free";
  const email =
    user?.emailAddresses?.[0]?.emailAddress ||
    sessionClaims?.email ||
    sessionClaims?.primary_email_address ||
    null;

  if (!email) {
    console.error("Unable to resolve Clerk email for authenticated user");
    return null;
  }

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const imageUrl = user?.imageUrl || "";
  const username = user?.username || email.split("@")[0] || `user_${userId}`;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    console.log("Checking user:", email, "Clerk subscription tier:", clerkSubscriptionTier);

    const existingUser = await findUserByClerkOrEmail(supabaseAdmin, userId, email);

    // User exists: sync mutable fields
    if (existingUser) {
      const updates = {};

      if (!existingUser.clerk_id) {
        updates.clerk_id = userId;
      }

      // ✅ TRUST DATABASE TIER: Only sync Clerk tier if:
      // 1. Clerk says "pro" (upgrade case), OR
      // 2. Database is null/undefined (first sync)
      // Never downgrade from pro to free based on Clerk claim alone
      if (
        clerkSubscriptionTier === "pro" &&
        existingUser.subscription_tier !== "pro"
      ) {
        console.log(
          `Syncing subscription tier: ${existingUser.subscription_tier} -> pro (Clerk upgrade)`
        );
        updates.subscription_tier = "pro";
      } else if (
        !existingUser.subscription_tier &&
        clerkSubscriptionTier === "free"
      ) {
        console.log("Setting initial subscription tier to free");
        updates.subscription_tier = "free";
      }

      if (existingUser.first_name !== firstName) updates.first_name = firstName;
      if (existingUser.last_name !== lastName) updates.last_name = lastName;
      if (existingUser.image_url !== imageUrl) updates.image_url = imageUrl;

      if (Object.keys(updates).length > 0) {
        console.log("Updating user:", updates);
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from("users")
          .update(updates)
          .eq("id", existingUser.id)
          .select("*")
          .single();

        if (updateError) {
          console.error("Failed to update user:", updateError.message);
          return mapUserRow(existingUser);
        }

        return mapUserRow(updatedUser);
      }

      console.log("User found and synced:", {
        id: existingUser.id,
        tier: existingUser.subscription_tier,
      });
      return mapUserRow(existingUser);
    }

    console.log("User not found in database, creating new user");

    const { data: authenticatedRole } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("type", "authenticated")
      .maybeSingle();

    const roleId = authenticatedRole?.id ?? 1;

    // Generate unique username with fallback for duplicates
    let uniqueUsername = username;
    let insertData = {
      username: uniqueUsername,
      email,
      password: `clerk_${userId}_${Date.now()}`,
      confirmed: true,
      blocked: false,
      role_id: roleId,
      clerk_id: userId,
      first_name: firstName,
      last_name: lastName,
      image_url: imageUrl,
      subscription_tier: clerkSubscriptionTier,
    };

    let { data: createdUser, error: createError } = await supabaseAdmin
      .from("users")
      .insert(insertData)
      .select("*")
      .single();

    // Handle duplicate username by appending random suffix
    if (createError?.code === "23505") {
      const concurrentUser = await findUserByClerkOrEmail(
        supabaseAdmin,
        userId,
        email
      );
      if (concurrentUser) {
        return mapUserRow(concurrentUser);
      }

      // If no user found by clerk/email, username is duplicate - regenerate it
      console.log("Username collision detected, generating unique username");
      uniqueUsername = `${username}_${Math.random().toString(36).substring(2, 9)}`;
      
      insertData.username = uniqueUsername;
      
      const { data: retryUser, error: retryError } = await supabaseAdmin
        .from("users")
        .insert(insertData)
        .select("*")
        .single();

      if (retryError) {
        console.error("Failed to create user after retry:", retryError.message);
        return null;
      }

      console.log("User created successfully with unique username:", {
        id: retryUser.id,
        username: uniqueUsername,
        subscriptionTier: clerkSubscriptionTier,
      });
      return mapUserRow(retryUser);
    }

    if (createError) {
      console.error("Failed to create user:", createError.message);
      return null;
    }

    console.log("User created successfully:", {
      id: createdUser.id,
      subscriptionTier: clerkSubscriptionTier,
    });
    return mapUserRow(createdUser);
  } catch (err) {
    console.error("checkUser error:", err);
    return null;
  }
};