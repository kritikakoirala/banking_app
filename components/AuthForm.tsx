"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CustomInput from "./CustomInput";
import { formSchema } from "@/lib/utils";
import { Button } from "./ui/button";
import { Form } from "@/components/ui/form";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/user.actions";
import PlaidLink from "./PlaidLink";

const AuthForm = ({ type }: { type: string }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const authFormSchema = formSchema(type);

  // Define the form
  const form = useForm<z.infer<typeof authFormSchema>>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (data: z.infer<typeof authFormSchema>) => {
    setIsLoading(true);

    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {
      // sign up with appwrite
      setError(null); // Clear any previous error

      const userData = {
        firstName: data?.firstName!,
        lastName: data?.lastName!,
        address1: data?.address1!,
        city: data?.city!,
        state: data?.state!,
        postalCode: data?.postalCode!,
        ssn: data?.ssn!,
        dateOfBirth: data?.dob!,
        email: data?.email,
        password: data?.password,
      };
      if (type === "sign-up") {
        const response = await signUp(userData);
        if (response?.error) {
          setError(response?.error);
        } else {
          setUser(response);
        }
      }

      if (type === "sign-in") {
        const response = await signIn({
          email: data?.email,
          password: data?.password,
        });

        if (response.error) {
          // If there's an error, display it on the frontend
          setError(response.error);
        } else {
          // Handle successful login (e.g., redirect, store session, etc.)
          <p>Loading...</p>;
          router.push("/");
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer items-center flex gap-1">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Horizon Logo"
          />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
            Horion{" "}
          </h1>
        </Link>
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}
            <p className="text-16 font-normal text-gray-600">
              {user
                ? "Link your Account to get started"
                : "Please enter your details"}
            </p>
          </h1>
        </div>
      </header>
      {user ? (
        <div className="flex flex-col gap-4">
          <PlaidLink user={user} variant="primary" />
        </div>
      ) : (
        <>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="font-bold">{error}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === "sign-up" ? (
                <>
                  <div className="flex gap-4">
                    <CustomInput
                      control={form.control}
                      name="firstName"
                      label="First Name"
                      placeholder="Enter your first name"
                    />

                    <CustomInput
                      control={form.control}
                      name="lastName"
                      label="Last Name"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <CustomInput
                    control={form.control}
                    name="address1"
                    label="Address"
                    placeholder="Enter your address"
                  />
                  <CustomInput
                    control={form.control}
                    name="city"
                    label="City"
                    placeholder="Enter your City"
                  />

                  <div className="flex gap-4">
                    <CustomInput
                      control={form.control}
                      name="state"
                      label="State"
                      placeholder="Ex. NY"
                    />

                    <CustomInput
                      control={form.control}
                      name="postalCode"
                      label="Postal Code"
                      placeholder="Ex: 11101"
                    />
                  </div>

                  <div className="flex gap-4">
                    <CustomInput
                      control={form.control}
                      name="dob"
                      label="Date Of Birth"
                      placeholder=" YYYY/MM/DD"
                    />

                    <CustomInput
                      control={form.control}
                      name="ssn"
                      label="SSN"
                      placeholder="Ex. 12345"
                    />
                  </div>

                  <CustomInput
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="Enter your email"
                  />

                  <CustomInput
                    control={form.control}
                    name="password"
                    label="Password"
                    placeholder="Enter your Password"
                  />
                </>
              ) : (
                <>
                  <CustomInput
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="Enter your email"
                  />

                  <CustomInput
                    control={form.control}
                    name="password"
                    label="Password"
                    placeholder="Enter your Password"
                  />
                </>
              )}

              <div className="flex flex-col gap-4">
                <Button type="submit" className="form-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader size={20} className="animate-spin" /> &nbsp;
                      Loading...
                    </>
                  ) : type === "sign-in" ? (
                    "Sign In"
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already Have an account?"}
            </p>
            <Link
              className="form-link"
              href={`${type === "sign-in" ? "/sign-up" : "/sign-in"}`}
            >
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
};

export default AuthForm;
