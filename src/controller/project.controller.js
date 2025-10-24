import { getWorkCounts } from "../components/get-work-counts.js";
import prisma from "../lib/prisma.js";


export const createProject = async (req, res) => {

    const { title, description, dueDate } = req.body;

    const { userId } = req.user;

    if (!title || !description) {
        return res.status(400).json({
            error: "Missing required fields",
            missing: [
                !title ? "title" : null,
                !description ? "description" : null,
            ].filter(Boolean),
        });
    }
    const project = await prisma.project.create({
        data: {
            title,
            description,
            dueDate: new Date(dueDate),
            createdBy: {
                connect: { id: userId },
            },
            members: {
                create: { userId, role: '101' }
            }
        },
        include: {
            members: true,
        }
    });

    return res.status(201).json(project);

};



export const getActiveProjects = async (req, res) => {
    const { userId } = req.user;
    const page = parseInt(req.query.page || '1')
    const page_size = parseInt(req.query.page_size || '10')
    const skip = (page - 1) * page_size;

    const totalProjects = await prisma.projectMember.count({
        where: {
            userId: userId,
        },
    });

    const active_projects = await prisma.project.findMany({
        where: {
            members: {
                some: {
                    userId
                }
            }
        },
        skip,
        take: page_size,
        orderBy: { id: 'desc' },
        select: {
            id: true,
            title: true,
            createdById: true,
            members: {
                where: { userId },
                select: { role: true }
            }
        },
    })

    res.send({
        link: {
            next: totalProjects > skip + page_size ? `/projects/active?page=${page + 1}&page_size=${page_size}` : null,
            prev: page > 1 ? `/projects/active?page=${page - 1}&page_size=${page_size}` : null
        },
        total_count: totalProjects,
        page: page,
        page_size: page_size,
        data: active_projects
    })

}

export const projectAnalytics = async (req, res) => {
    const userId = req.user.userId;
    const projectId = parseInt(req.params.projectId);
    const selectedUser = req.query.selectedUser ? parseInt(req.query.selectedUser) : null;
    try {


        const projectMember = await prisma.projectMember.findFirst({
            where: {
                projectId, userId
            },
            select: { id: true, role: true }
        });

        if (!projectMember) res.status(403).json({ error: "Access denied to this project" });
        console.log('|| Project Member ||', projectMember);

        const { role } = projectMember;
        console.log('|| Role || ', role);
        const baseFilter = {
            projectId,
        };

        if (role !== '101' || role !== '201' || role !== '501') {
            if (selectedUser) {
                baseFilter.project = { members: { some: { userId: selectedUser } } };
            }
        } else {
            baseFilter.project = { members: { some: { userId: userId } } }
        }
        console.log(baseFilter);

        const works = await prisma.work.findMany({
            where: {
                ...baseFilter,
            },
            select: { type: true, status: true, }
        });

        const workCount = getWorkCounts(works);

        res.status(200).json(workCount);
    } catch (error) {
        console.log('|| Error ||', error);
        res.status(500).json({ error: "Internal server error", error });
    }
}
export const getProjectsProgress = async (req, res) => {
    try {
        const userId = req.user.userId
        if (!userId) {
            return res.status(400).json({ success: false, message: "Missing userId" });
        }

        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { createdById: Number(userId) },
                    { members: { some: { userId: Number(userId) } } },
                ],
            },
            take: 3,
            orderBy: {
                id: "desc",
            },
            select: {
                id: true,
                title: true,
                works: {
                    select: { progress: true },
                },
            },
        });

        if (!projects.length) {
            return res.status(404).json({
                success: false,
                message: "No projects found for this user",
            });
        }

        const projectData = projects.map((project) => {
            const works = project.works || [];
            const totalProgress = works.reduce((sum, w) => sum + (w.progress || 0), 0);
            const averageProgress =
                works.length > 0 ? totalProgress / works.length : 0;

            return {
                id: project.id,
                name: project.title,
                progress: Math.round(averageProgress),
            };
        });

        return res.status(200).json({
            success: true,
            projects: projectData,
        });
    } catch (error) {
        console.error("💥 Error in getProjectsProgress:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const getProjectsNearDeadline = async (req, res) => {
  try {
    const userId = req.user?.userId || req.query.userId; 
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    
    const projects = await prisma.project.findMany({
      where: {
        AND: [
          {
            OR: [
              { createdById: Number(userId) },
              { members: { some: { userId: Number(userId) } } },
            ],
          },
          { dueDate: { not: null } }, 
        ],
      },
      take: 5, 
      orderBy: { dueDate: "asc" }, 
      select: {
        id: true,
        title: true,
        dueDate: true,
      },
    });

    if (!projects.length) {
      return res.status(404).json({ success: false, message: "No projects with deadlines found" });
    }

    
    const projectData = projects.map((project) => {
      const works = project.works || [];
      const totalProgress = works.reduce((sum, w) => sum + (w.progress || 0), 0);
      const averageProgress = works.length > 0 ? totalProgress / works.length : 0;

      return {
        id: project.id,
        name: project.title,
        progress: Math.round(averageProgress),
        dueDate: project.dueDate,
      };
    });

    
    return res.status(200).json({ success: true, projects: projectData });
  } catch (error) {
    console.error("💥 Error in getProjectsNearDeadline:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
