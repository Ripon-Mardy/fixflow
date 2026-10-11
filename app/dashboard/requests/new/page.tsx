import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser, can } from "@/lib/auth";
import { getNewRequestFormData } from "@/lib/queries/form-data";
import { PageHeader } from "@/components/dashboard/page-header";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const metadata: Metadata = { title: "New request" };

export default async function NewRequestPage() {
  const user = await requireUser();
  if (!can(user, "request.create")) redirect("/dashboard/requests");

  const data = await getNewRequestFormData(user);
  const isTenant = user.role === "TENANT";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New maintenance request"
        description={
          isTenant
            ? "Tell us what's wrong and we'll get it assigned."
            : "Log a request on behalf of a tenant."
        }
      />

      {isTenant && !user.unit ? (
        <Alert variant="warning">
          <Info />
          <AlertTitle>No unit linked to your account</AlertTitle>
          <AlertDescription>
            Ask your property manager to assign you to a unit before submitting a
            request.
          </AlertDescription>
        </Alert>
      ) : (
        <CreateRequestForm
          categories={data.categories}
          properties={data.properties}
          fixedProperty={data.fixedProperty}
          fixedUnit={data.fixedUnit}
          isTenant={isTenant}
        />
      )}
    </div>
  );
}
