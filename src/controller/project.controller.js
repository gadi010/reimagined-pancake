import prisma from "../lib/prisma.js";


export const createProject = async (req, res) => {

    const { title, description } = req.body;

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