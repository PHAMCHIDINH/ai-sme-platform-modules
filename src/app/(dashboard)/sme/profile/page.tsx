import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { actionFailure, actionSuccess, type FormActionResult } from "@/modules/shared";
import { findSmeProfileForEdit, upsertSmeProfileByUserId } from "@/modules/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/ui";
import { smeProfileSchema, type SmeProfileInput } from "@/modules/project";
import { SmeProfileForm } from "./sme-profile-form";

export default async function SmeProfilePage() {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");

  if (!smeUserId) {
    return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;
  }

  const existingProfile = await findSmeProfileForEdit(smeUserId);

  const initialValues: SmeProfileInput = {
    companyName: existingProfile?.companyName ?? "",
    avatarUrl: existingProfile?.avatarUrl ?? "",
    industry: existingProfile?.industry ?? "",
    companySize: existingProfile?.companySize ?? "",
    description: existingProfile?.description ?? "",
  };

  async function updateSmeProfile(formData: FormData): Promise<FormActionResult> {
    "use server";

    const activeSession = await auth();
    const activeSmeUserId = getSessionUserIdByRole(activeSession, "SME");

    if (!activeSmeUserId) {
      return actionFailure("Bạn không có quyền thực hiện thao tác này.");
    }

    const parsed = smeProfileSchema.safeParse({
      companyName: String(formData.get("companyName") ?? ""),
      avatarUrl: String(formData.get("avatarUrl") ?? ""),
      industry: String(formData.get("industry") ?? ""),
      companySize: String(formData.get("companySize") ?? ""),
      description: String(formData.get("description") ?? ""),
    });

    if (!parsed.success) {
      return actionFailure(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
    }

    await upsertSmeProfileByUserId(activeSmeUserId, parsed.data);

    revalidatePath("/sme/profile");
    revalidatePath("/sme/dashboard");
    revalidatePath("/sme/projects");
    return actionSuccess();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="portal-shell p-6 md:p-8">
        <div className="flex items-center gap-3">
          <Avatar className="size-14">
            <AvatarImage alt="Avatar doanh nghiệp" src={initialValues.avatarUrl || undefined} />
            <AvatarFallback className="bg-emerald-100 text-base font-semibold text-emerald-700">
              {initialValues.companyName.charAt(0).toUpperCase() || "SME"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Hồ sơ doanh nghiệp</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Cập nhật thông tin công ty để tăng độ rõ ràng cho luồng sourcing và nâng chất lượng ứng viên.
        </p>
      </div>

      <SmeProfileForm
        initialValues={initialValues}
        submitAction={updateSmeProfile}
      />
    </div>
  );
}
