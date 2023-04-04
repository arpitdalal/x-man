import {
  createCookieSessionStorage,
  redirect,
  type Session,
} from "@remix-run/node";
import {
  createClient,
  type User,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";
import { safeRedirect } from "remix-utils";
import type { Expense, Income } from "~/types";
import type { Database } from "~/types/supabase";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_KEY: string;
      SESSION_SECRET: string;
    }
  }
}

type AuthForm = {
  email: string;
  password: string;
};

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is required");
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY is required");
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_KEY is required");
}

const supabaseOptions: SupabaseClientOptions<"public"> = {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: { "x-application-name": "X Man" },
  },
};

const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  supabaseOptions
);

export const authCookie = createCookieSessionStorage({
  cookie: {
    name: "sb:token",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export function setAuthSession(
  session: Session,
  accessToken: string,
  refreshToken: string,
  userId: User["id"]
) {
  try {
    session.set("access_token", accessToken);
    session.set("refresh_token", refreshToken);
    session.set("user_id", userId);

    return { session };
  } catch {
    return {
      error: "something went wrong",
    };
  }
}

function hasAuthSession(session: Session) {
  try {
    return session.has("access_token");
  } catch {
    return false;
  }
}

export async function hasActiveAuthSession(session: Session) {
  try {
    if (!hasAuthSession(session)) return false;

    const { user, error } = await getUserByAccessToken(
      session.get("access_token")
    );

    if (error || !user) return false;
    return true;
  } catch {
    return false;
  }
}

export async function refreshUserToken(session: Session) {
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: session.get("refresh_token"),
    });

    if (error || !data || !data.session || !data.user) {
      return { error: error?.message || "Something went wrong" };
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      userId: data.user.id,
    };
  } catch {
    return { error: "Something went wrong" };
  }
}

export async function loginUser({ email, password }: AuthForm) {
  try {
    const { data, error: loginError } =
      await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (loginError || !data || !data.session || !data.user) {
      return { error: loginError?.message || "Something went wrong" };
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      userId: data.user.id,
    };
  } catch {
    return { error: "Something went wrong" };
  }
}

export async function registerUser({ email, password }: AuthForm) {
  try {
    const { data, error: signUpError } = await supabaseAdmin.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data || !data.user) {
      return { error: signUpError?.message || "Something went wrong" };
    }

    return { user: data.user };
  } catch {
    return {
      error: "Something went wrong",
    };
  }
}

export async function signOutUser(session: Session) {
  try {
    const { error } = await supabaseAdmin.auth.signOut();
    if (error) {
      return { done: false, error: error?.message || "Something went wrong" };
    }
    return { done: true };
  } catch {
    return {
      done: false,
      error: "Something went wrong",
    };
  }
}

export async function getUserByAccessToken(accessToken: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !data.user) {
      return { error: error?.message || "Something went wrong" };
    }

    return { user: data.user };
  } catch {
    return {
      error: "Something went wrong",
    };
  }
}

export async function sendResetPasswordEmailForUser({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo: string;
}) {
  try {
    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(
      email,
      {
        redirectTo,
      }
    );

    if (error || data === null) {
      return { error: error?.message || "Something went wrong" };
    }
    return {};
  } catch (error) {
    return {
      error: "Something went wrong",
    };
  }
}

export async function resetPasswordForUser({
  password,
  session,
}: {
  password: string;
  session: Session;
}) {
  try {
    const { user, error: userError } = await getUserByAccessToken(
      session.get("access_token")
    );

    if (userError || !user) {
      return { error: userError || "Something went wrong" };
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password,
      }
    );

    if (error || !data) {
      return { error: error?.message || "Something went wrong" };
    }

    return { user: data.user };
  } catch {
    return {
      error: "Something went wrong",
    };
  }
}

export default async function authenticated(
  request: Request,
  successFunction: (user: User) => Response | Promise<Response>,
  failureFunction: () => Response | Promise<Response>,
  redirectTo?: string
) {
  try {
    let session = await authCookie.getSession(request.headers.get("Cookie"));
    const url = new URL(request.url);
    const redirectUrl = redirectTo || `${url.pathname}${url.search}`;

    const isActiveAuthSession = await hasActiveAuthSession(session);
    if (!isActiveAuthSession) {
      const { accessToken, refreshToken, userId, error } =
        await refreshUserToken(session);
      if (error || !accessToken || !refreshToken || !userId) {
        throw new Error("refreshUserToken " + error);
      }
      const { session: newSession, error: newSessionError } = setAuthSession(
        session,
        accessToken,
        refreshToken,
        userId
      );

      if (!newSession || newSessionError) {
        throw new Error("setAuthSession " + newSessionError);
      }

      return redirect(safeRedirect(redirectUrl, "/"), {
        headers: {
          "Set-Cookie": await authCookie.commitSession(newSession, {
            expires: new Date(Date.now() + 3600),
          }),
        },
      });
    }

    const { user, error: accessTokenError } = await getUserByAccessToken(
      session.get("access_token")
    );

    if (accessTokenError || !user || !user.email || !user.id) {
      throw new Error("getUserByAccessToken " + accessTokenError);
    }

    return await successFunction(user);
  } catch (error) {
    console.log(error); // You should log this error to your logging system
    return failureFunction();
  }
}

export async function getProfileById(userId: User["id"]) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !profile) {
      console.log("getProfileById", error);
      return {
        error: error,
      };
    }

    return { profile };
  } catch (error) {
    // TODO: log error nicely
    console.log("getProfileById ", error);
    return {
      error: "Something went wrong",
    };
  }
}

type ExpenseOrIncomeArgs = {
  month: string;
  year: string;
  userId: User["id"];
};
export async function getAllExpenses({
  userId,
  month,
  year,
}: ExpenseOrIncomeArgs) {
  try {
    const { data: expenses, error } = await supabaseAdmin
      .from("expenses")
      .select(`*`)
      .eq("user_id", userId)
      .eq("month", month)
      .eq("year", year);

    if (error || !expenses) {
      console.log("getAllExpenses", error);
      return {
        error: error,
      };
    }

    return { expenses };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllExpenses ", error);
    return {
      error: "Something went wrong",
    };
  }
}

export async function getAllIncome({
  userId,
  month,
  year,
}: ExpenseOrIncomeArgs) {
  try {
    const { data: income, error } = await supabaseAdmin
      .from("income")
      .select()
      .eq("user_id", userId)
      .eq("month", month)
      .eq("year", year);

    if (error || !income) {
      console.log("getAllIncome", error);
      return {
        error: error,
      };
    }

    return { income };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllIncome", error);
    return {
      error: "Something went wrong",
    };
  }
}

type InsertExpenseArgs = Pick<
  Expense,
  "title" | "amount" | "day" | "month" | "year" | "categories"
>;
export async function insertExpense({
  expense,
  userId,
}: {
  expense: InsertExpenseArgs;
  userId: User["id"];
}) {
  try {
    const { data: newExpense, error } = await supabaseAdmin
      .from("expenses")
      .insert({
        ...expense,
        user_id: userId,
      })
      .select()
      .single();

    if (error || !newExpense) {
      console.log("insertExpense", error);
      return {
        error: error,
      };
    }

    return { expense: newExpense };
  } catch (error) {
    // TODO: log error nicely
    console.log("insertExpense", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetExpenseByIdArgs = {
  expenseId: Expense["id"];
  userId: User["id"];
};
export async function getExpenseById({
  expenseId,
  userId,
}: GetExpenseByIdArgs) {
  try {
    const { data: expense, error } = await supabaseAdmin
      .from("expenses")
      .select(`*`)
      .eq("id", expenseId)
      .eq("user_id", userId)
      .single();

    if (error || !expense) {
      console.log("getExpenseById", error);
      return {
        error: error,
      };
    }

    return { expense };
  } catch (error) {
    // TODO: log error nicely
    console.log("getExpenseById", error);
    return {
      error: "Something went wrong",
    };
  }
}

type UpdateExpenseArgs = {
  expenseId: Expense["id"];
  userId: User["id"];
  query: Partial<Pick<Expense, "title" | "amount" | "categories">>;
};
export async function updateExpense({
  expenseId,
  userId,
  query,
}: UpdateExpenseArgs) {
  try {
    const { data: expense, error } = await supabaseAdmin
      .from("expenses")
      .update({
        ...query,
      })
      .eq("id", expenseId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !expense) {
      console.log("updateExpense", error);
      return {
        error: error,
      };
    }

    return { expense };
  } catch (error) {
    // TODO: log error nicely
    console.log("updateExpense", error);
    return {
      error: "Something went wrong",
    };
  }
}

type DeleteExpenseArgs = {
  expenseId: Expense["id"];
  userId: User["id"];
};
export async function deleteExpense({ expenseId, userId }: DeleteExpenseArgs) {
  try {
    const { error } = await supabaseAdmin
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", userId);

    if (error) {
      console.log("deleteExpense", error);
      return {
        success: false,
      };
    }

    return { success: true };
  } catch (error) {
    // TODO: log error nicely
    console.log("deleteExpense", error);
    return {
      error: "Something went wrong",
    };
  }
}

type InsertIncomeArgs = Pick<
  Income,
  "title" | "amount" | "day" | "month" | "year" | "categories" | "addInTenPer"
>;
export async function insertIncome({
  income,
  userId,
}: {
  income: InsertIncomeArgs;
  userId: User["id"];
}) {
  try {
    const { data: newIncome, error } = await supabaseAdmin
      .from("income")
      .insert({
        ...income,
        user_id: userId,
      })
      .select()
      .single();

    if (error || !newIncome) {
      console.log("insertIncome", error);
      return {
        error: error,
      };
    }

    return { income: newIncome };
  } catch (error) {
    // TODO: log error nicely
    console.log("insertIncome", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetIncomeByIdArgs = {
  incomeId: Income["id"];
  userId: User["id"];
};
export async function getIncomeById({ incomeId, userId }: GetIncomeByIdArgs) {
  try {
    const { data: income, error } = await supabaseAdmin
      .from("income")
      .select(`*`)
      .eq("id", incomeId)
      .eq("user_id", userId)
      .single();

    if (error || !income) {
      console.log("getIncomeById", error);
      return {
        error: error,
      };
    }

    return { income };
  } catch (error) {
    // TODO: log error nicely
    console.log("getIncomeById", error);
    return {
      error: "Something went wrong",
    };
  }
}

type UpdateIncomeArgs = {
  incomeId: Income["id"];
  userId: User["id"];
  query: Partial<
    Pick<Income, "title" | "amount" | "categories" | "addInTenPer">
  >;
};
export async function updateIncome({
  incomeId,
  userId,
  query,
}: UpdateIncomeArgs) {
  try {
    const { data: income, error } = await supabaseAdmin
      .from("income")
      .update({
        ...query,
      })
      .eq("id", incomeId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !income) {
      console.log("updateIncome", error);
      return {
        error: error,
      };
    }

    return { income };
  } catch (error) {
    // TODO: log error nicely
    console.log("updateIncome", error);
    return {
      error: "Something went wrong",
    };
  }
}

type DeleteIncomeArgs = {
  incomeId: Income["id"];
  userId: User["id"];
};
export async function deleteIncome({ incomeId, userId }: DeleteIncomeArgs) {
  try {
    const { error } = await supabaseAdmin
      .from("income")
      .delete()
      .eq("id", incomeId)
      .eq("user_id", userId);

    if (error) {
      console.log("deleteIncome", error);
      return {
        success: false,
      };
    }

    return { success: true };
  } catch (error) {
    // TODO: log error nicely
    console.log("deleteIncome", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetAllCategoriesArgs = {
  userId: User["id"];
};
export async function getAllCategories({ userId }: GetAllCategoriesArgs) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select()
      .in("user_id", ["*", userId]);
    if (error || !categories) {
      console.log("getAllCategories", error);
      return {
        error: error,
      };
    }

    return {
      categories,
    };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetAllExpenseCategoriesArgs = {
  userId: User["id"];
};
export async function getAllExpenseCategories({
  userId,
}: GetAllExpenseCategoriesArgs) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select()
      .eq("expense", true)
      .in("user_id", ["*", userId]);
    if (error || !categories) {
      console.log("getAllExpenseCategories", error);
      return {
        error: error,
      };
    }

    return {
      expenseCategories: categories,
    };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllExpenseCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetAllIncomeCategoriesArgs = {
  userId: User["id"];
};
export async function getAllIncomeCategories({
  userId,
}: GetAllIncomeCategoriesArgs) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select()
      .eq("expense", false)
      .in("user_id", ["*", userId]);
    if (error || !categories) {
      console.log("getAllIncomeCategories", error);
      return {
        error: error,
      };
    }

    return {
      incomeCategories: categories,
    };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllIncomeCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetAllDefaultCategoriesArgs = {
  userId: User["id"];
  expense: boolean;
};
export async function getAllDefaultCategories({
  userId,
  expense,
}: GetAllDefaultCategoriesArgs) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select()
      .eq("expense", expense)
      .eq("user_id", "*");
    if (error || !categories) {
      console.log("getAllDefaultCategories", error);
      return {
        success: false,
      };
    }

    return { categories };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllDefaultCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}
