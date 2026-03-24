import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "@/modules/shared";
import { err, ok, type Result } from "@/modules/shared";

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

type RegisterErrorCode = "EMAIL_EXISTS";

export type RegisterResult = Result<null, RegisterErrorCode>;

export async function registerUserAndProfile(input: RegisterUserInput): Promise<RegisterResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    return err("EMAIL_EXISTS", "Email này đã được sử dụng.");
  }

  const hashedPassword = await hash(input.password, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
      },
    });

    if (input.role === "SME") {
      await tx.sMEProfile.create({
        data: {
          userId: user.id,
          companyName: "",
          industry: "",
          companySize: "",
          description: "",
        },
      });
      return;
    }

    await tx.studentProfile.create({
      data: {
        userId: user.id,
        university: "",
        major: "",
        availability: "",
        description: "",
      },
    });
  });

  return ok(null);
}
