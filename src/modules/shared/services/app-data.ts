import { prisma } from "../kernel/prisma";

type CreateProjectInput = {
  smeUserId: string;
  title: string;
  description: string;
  standardizedBrief?: string | null;
  expectedOutput: string;
  requiredSkills: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  duration: string;
  budget?: string | null;
  embedding: number[];
};

type UpsertStudentProfileInput = {
  userId: string;
  university: string;
  major: string;
  skills: string[];
  technologies: string[];
  avatarUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  availability: string;
  description: string;
  interests: string[];
  embedding: number[];
  shouldRegenerateEmbedding: boolean;
};

type CreateSmeEvaluationInput = {
  projectId: string;
  evaluatorId: string;
  evaluateeId: string;
  outputQuality: number;
  onTime: number;
  proactiveness: number;
  communication: number;
  overallFit: number;
  comment: string | null;
};

type SmeProfileUpsertData = {
  companyName: string;
  industry: string;
  companySize: string;
  description: string;
};

export async function findSmeProfileByUserId(userId: string) {
  return prisma.sMEProfile.findUnique({
    where: { userId },
  });
}

export async function createProjectForSme(input: CreateProjectInput) {
  const smeProfile = await prisma.sMEProfile.findUnique({
    where: { userId: input.smeUserId },
    select: { id: true },
  });

  if (!smeProfile) {
    return null;
  }

  const project = await prisma.project.create({
    data: {
      smeId: smeProfile.id,
      title: input.title,
      description: input.description,
      standardizedBrief: input.standardizedBrief ?? null,
      expectedOutput: input.expectedOutput,
      requiredSkills: input.requiredSkills,
      difficulty: input.difficulty,
      duration: input.duration,
      budget: input.budget ?? null,
      status: "OPEN",
      embedding: input.embedding,
    },
  });

  return project;
}

export async function listProjectsByRole(userId: string, role: "SME" | "STUDENT") {
  if (role === "SME") {
    const smeProfile = await prisma.sMEProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!smeProfile) {
      return [];
    }

    return prisma.project.findMany({
      where: { smeId: smeProfile.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });
  }

  return prisma.project.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function findProjectForMatching(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      embedding: true,
      title: true,
      sme: {
        select: {
          userId: true,
        },
      },
    },
  });
}

export async function listStudentsWithEmbeddingAndUser() {
  return prisma.studentProfile.findMany({
    where: { NOT: { embedding: { equals: [] } } },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function findStudentProfileForApi(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
    select: {
      university: true,
      major: true,
      skills: true,
      technologies: true,
      avatarUrl: true,
      githubUrl: true,
      portfolioUrl: true,
      availability: true,
      description: true,
      interests: true,
    },
  });
}

export async function findStudentProfileForEmbeddingRefresh(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
    select: {
      major: true,
      skills: true,
      technologies: true,
      interests: true,
      description: true,
      embedding: true,
    },
  });
}

export async function upsertStudentProfile(input: UpsertStudentProfileInput) {
  return prisma.studentProfile.upsert({
    where: { userId: input.userId },
    update: {
      university: input.university,
      major: input.major,
      skills: input.skills,
      technologies: input.technologies,
      avatarUrl: input.avatarUrl,
      githubUrl: input.githubUrl,
      portfolioUrl: input.portfolioUrl,
      availability: input.availability,
      description: input.description,
      interests: input.interests,
      ...(input.shouldRegenerateEmbedding ? { embedding: input.embedding } : {}),
    },
    create: {
      userId: input.userId,
      university: input.university,
      major: input.major,
      skills: input.skills,
      technologies: input.technologies,
      avatarUrl: input.avatarUrl,
      githubUrl: input.githubUrl,
      portfolioUrl: input.portfolioUrl,
      availability: input.availability,
      description: input.description,
      interests: input.interests,
      embedding: input.embedding,
    },
  });
}

export async function listStudentsForSmeSearch() {
  return prisma.studentProfile.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });
}

export async function findSmeDashboardProfile(userId: string) {
  return prisma.sMEProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      companyName: true,
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });
}

export async function findSmeDashboardMetrics(smeId: string) {
  const [activeProjects, totalApplicants, recentProjects] = await Promise.all([
    prisma.project.count({
      where: {
        smeId,
        status: { in: ["IN_PROGRESS", "SUBMITTED"] },
      },
    }),
    prisma.application.count({
      where: {
        project: { smeId },
      },
    }),
    prisma.project.findMany({
      where: { smeId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        _count: {
          select: { applications: true },
        },
      },
    }),
  ]);

  return {
    activeProjects,
    totalApplicants,
    recentProjects,
  };
}

export async function listSmeProjectsByUserId(userId: string) {
  const smeProfile = await prisma.sMEProfile.findUnique({
    where: { userId },
  });

  if (!smeProfile) {
    return [];
  }

  return prisma.project.findMany({
    where: { smeId: smeProfile.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
}

export async function findSmeProfileForEdit(userId: string) {
  return prisma.sMEProfile.findUnique({
    where: { userId },
    select: {
      companyName: true,
      industry: true,
      companySize: true,
      description: true,
    },
  });
}

export async function upsertSmeProfileByUserId(
  userId: string,
  data: SmeProfileUpsertData,
) {
  return prisma.sMEProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}

export async function findSmeProjectDetailById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sme: true,
      _count: {
        select: {
          applications: true,
        },
      },
      progress: true,
      evaluations: {
        where: { type: "SME_TO_STUDENT" },
        select: { id: true },
        take: 1,
      },
    },
  });
}

export async function findProjectWithApplications(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sme: true,
      applications: {
        select: {
          studentId: true,
          status: true,
          initiatedBy: true,
        },
      },
    },
  });
}

export async function listApplicantProfilesByIds(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  return prisma.studentProfile.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      university: true,
      skills: true,
      avatarUrl: true,
      embedding: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function listSuggestionProfilesExcludingIds(ids: string[]) {
  return prisma.studentProfile.findMany({
    where: {
      ...(ids.length
        ? {
            id: {
              notIn: ids,
            },
          }
        : {}),
    },
    select: {
      id: true,
      university: true,
      skills: true,
      avatarUrl: true,
      embedding: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function findSmeProjectForEvaluationPage(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sme: true,
      progress: {
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      evaluations: {
        where: { type: "SME_TO_STUDENT" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function findOwnedProjectForEvaluation(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sme: true,
      progress: {
        include: {
          student: true,
        },
      },
      evaluations: {
        where: { type: "SME_TO_STUDENT" },
        select: { id: true },
        take: 1,
      },
    },
  });
}

export async function createSmeEvaluation(input: CreateSmeEvaluationInput) {
  return prisma.evaluation.create({
    data: {
      projectId: input.projectId,
      evaluatorId: input.evaluatorId,
      evaluateeId: input.evaluateeId,
      type: "SME_TO_STUDENT",
      outputQuality: input.outputQuality,
      onTime: input.onTime,
      proactiveness: input.proactiveness,
      communication: input.communication,
      overallFit: input.overallFit,
      comment: input.comment,
    },
  });
}

export async function findStudentProfileWithEmbedding(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      embedding: true,
    },
  });
}

export async function listAvailableProjectsForStudent(studentId: string | null) {
  return prisma.project.findMany({
    where: {
      status: "OPEN",
      ...(studentId
        ? {
            applications: {
              none: {
                studentId,
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      expectedOutput: true,
      requiredSkills: true,
      duration: true,
      embedding: true,
      sme: {
        select: {
          companyName: true,
        },
      },
    },
  });
}

export async function listStudentDiscoveryProjects(studentId: string | null) {
  return prisma.project.findMany({
    where: {
      OR: [
        { status: "OPEN" },
        ...(studentId
          ? [
              {
                applications: {
                  some: { studentId },
                },
              },
            ]
          : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      standardizedBrief: true,
      expectedOutput: true,
      requiredSkills: true,
      duration: true,
      budget: true,
      difficulty: true,
      status: true,
      embedding: true,
      sme: {
        select: {
          companyName: true,
          industry: true,
          description: true,
        },
      },
      applications: studentId
        ? {
            where: { studentId },
            select: {
              status: true,
              initiatedBy: true,
            },
            take: 1,
          }
        : false,
    },
  });
}

export async function findStudentDiscoveryProjectById(projectId: string, studentId: string | null) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { status: "OPEN" },
        ...(studentId
          ? [
              {
                applications: {
                  some: { studentId },
                },
              },
            ]
          : []),
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      standardizedBrief: true,
      expectedOutput: true,
      requiredSkills: true,
      duration: true,
      budget: true,
      difficulty: true,
      status: true,
      embedding: true,
      sme: {
        select: {
          companyName: true,
          industry: true,
          description: true,
        },
      },
      applications: studentId
        ? {
            where: { studentId },
            select: {
              status: true,
              initiatedBy: true,
            },
            take: 1,
          }
        : false,
    },
  });
}

export async function listStudentInvitations(studentId: string) {
  return prisma.application.findMany({
    where: {
      studentId,
      status: "INVITED",
      initiatedBy: "SME",
    },
    include: {
      project: {
        include: {
          sme: true,
        },
      },
    },
  });
}

export async function findStudentDashboardData(userId: string) {
  const [profileResult, evaluationSummary] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { userId },
      select: {
        skills: true,
        _count: {
          select: {
            applications: true,
          },
        },
        progressEntries: {
          select: {
            status: true,
          },
        },
      },
    }),
    prisma.evaluation.aggregate({
      where: { evaluateeId: userId, type: "SME_TO_STUDENT" },
      _avg: {
        overallFit: true,
      },
      _count: {
        overallFit: true,
      },
    }),
  ]);

  return {
    profileResult,
    evaluationSummary,
  };
}

export async function findStudentProfileByUserId(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
  });
}

export async function listProgressEntriesByStudentId(studentId: string, evaluatorId: string) {
  return prisma.projectProgress.findMany({
    where: { studentId },
    include: {
      project: {
        include: {
          sme: true,
          evaluations: {
            where: {
              type: "STUDENT_TO_SME",
              evaluatorId,
            },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { deadline: "asc" },
  });
}
