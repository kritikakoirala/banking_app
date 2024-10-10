"use server";

import { createAdminClient, createSessionClient } from "../appwrite";
import { AppwriteException, ID, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database?.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(user.documents[0]);
  } catch (err) {
    console.log(err);
  }
};

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createEmailPasswordSession(email, password);
    try {
      cookies().set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      const user = await getUserInfo({ userId: session?.userId });
      return parseStringify(user);
    } catch (error) {
      return { error: "There is no such user. Please sign up first" };
      // console.log("Something went wrong with the session", error);
    }
  } catch (error) {
    // If an AppwriteException occurs, return the error message to frontend
    if (error instanceof AppwriteException) {
      // Return error with a proper HTTP status and message
      return { error: error.message };
    }

    // For any other error (network, server, etc.)
    return { error: "An unexpected error occurred." };
  }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  const { email, firstName, lastName } = userData;

  let newUserAccount;
  try {
    const { account, database } = await createAdminClient();
    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    if (!newUserAccount) throw new Error("Error creating user");

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: "personal",
    });

    if (!dwollaCustomerUrl) throw new Error("Error creating dwolla customer");

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount?.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
      }
    );

    if (!newUser) return;

    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUser);
  } catch (error: unknown) {
    console.log("Error while signing up", error);

    console.log("Error while signing up:", error);

    // Rollback or cleanup logic if needed
    if (newUserAccount) {
      const { account } = await createAdminClient();

      // Optionally, delete the user account from Appwrite if it was created
      await account.deleteSession(newUserAccount.$id);
    }

    // Type assertion to check if error is an instance of Error
    if (isDwollaError(error)) {
      const dwollaErrors = error._embedded.errors;

      const messages = dwollaErrors.map((err) => {
        switch (err.code) {
          case "Duplicate":
            return "The email address is already associated with an existing account.";
          case "InvalidFormat":
            return `The ${err.path.replace("/", "")} format is invalid.`;
          case "MissingField":
            return "Please fill in all required fields.";
          default:
            return "There was an issue with your input.";
        }
      });

      return { error: messages.join(" ") };
    }

    // If an AppwriteException occurs, return the error message to frontend
    if (error instanceof AppwriteException) {
      return { error: error.message };
    }

    // If an AppwriteException occurs, return the error message to frontend
    if (error instanceof AppwriteException) {
      // Return error with a proper HTTP status and message
      return { error: error.message };
    }

    // For any other error (network, server, etc.)
    return { error: "An unexpected error occurred." };
  }
};

// Helper function to determine if it's a Dwolla error
function isDwollaError(
  error: any
): error is { _embedded: { errors: Array<{ code: string; path: string }> } } {
  return (
    error &&
    typeof error._embedded === "object" &&
    Array.isArray(error._embedded.errors)
  );
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();
    const user = await getUserInfo({ userId: result?.$id });
    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();
    cookies().delete("appwrite-session");
    await account.deleteSession("current");
  } catch (err) {
    console.log(err);
  }
};

export const createLinkToken = async (user: User) => {
  try {
    const banks = await getBanks({ userId: user?.$id });
    const tokenParams = {
      user: {
        client_user_id: user?.$id,
      },
      client_name: `${user?.firstName} ${user?.lastName}`,
      products: ["auth", "transactions"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);
    return parseStringify({ linkToken: response?.data?.link_token });
  } catch (err) {
    console.log(err);
  }
};

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  sharableId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();
    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        sharableId,
      }
    );

    return parseStringify(bankAccount);
  } catch (err) {
    console.log(err);
  }
};

export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response?.data?.access_token;
    const itemId = response?.data?.item_id;
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    const accountData = accountsResponse?.data?.accounts[0];

    // Create a processor token for Dwolla using the access token and account ID
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(
      request
    );
    const processorToken = processorTokenResponse.data.processor_token;

    // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    // If the funding source URL is not created, throw an error
    if (!fundingSourceUrl) throw Error;

    // Ensure userId exists and is valid before calling createBankAccount
    if (!user?.$id) {
      console.error("userId is undefined or invalid:", user);
      throw new Error("Invalid userId. Cannot create bank account.");
    }

    // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
    await createBankAccount({
      userId: user?.$id,
      bankId: itemId,
      accountId: accountData?.account_id,
      accessToken,
      fundingSourceUrl,
      sharableId: encryptId(accountData?.account_id),
    });

    // Revalidate the path to reflect the changes
    revalidatePath("/");

    // Return a success message
    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (err) {
    console.log(err);
  }
};

export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const { database } = await createAdminClient();

    const banks = await database?.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(banks.documents);
  } catch (err) {
    console.log(err);
  }
};

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database?.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("$id", [documentId])]
    );

    return parseStringify(bank.documents[0]);
  } catch (err) {
    console.log(err);
  }
};

export const getBankByAccountId = async ({
  accountId,
}: getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database?.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("accountId", [accountId])]
    );

    if (bank?.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (err) {
    console.log(err);
  }
};
