"use client";

import Loading from "../../loading";
import useSWR from "swr";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { APIResponse, CreateError } from "@/app/interfaces/CreateError";

const getErrorMessages = (error: CreateError) => {
  switch (error) {
    case "UNERR":
      return "Error: Payment method not found";
    case "PAID":
      return "Error: Dispute already paid";
  }
}

interface ProfilePage {
    did: string;
    }

/**
 *
 * @returns a redirection to the payment page if valid, error message if wrong
 */
export default function Profile({did} : ProfilePage) {  

  const { data } = useSWR<APIResponse>(did ? `/api/${did}` : null, fetcher);

  useEffect(() => {
    if (data?.url !== undefined) redirect(data.url);
  }, [data]);

  if (data?.error !== undefined)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-4xl font-bold dark:text-white my-3">
          {getErrorMessages(data.error as CreateError)}
        </h2>
      </div>
    );
  return <Loading />;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};
