import { Request, Response } from "express";
import prisma from "../lib/prisma.js"

export const addUser = async (req: Request, res: Response) => {

    const { email, projectId, role } = req.body;

    const userExist = await prisma.user.findUnique({
        where: { email }
    });

    if (!userExist) {
        const handleUnexistUser = await import("../components/hande-unexist-user.js");
        await handleUnexistUser.userDoenstExist(email, projectId);
        return res.status(404).json({ error: "User does not exist. Invitation email sent if applicable." });
    }

    const adduser = await prisma.projectMember.create({
        data: {
            user: {
                connect: { id: userExist.id }
            },
            project: {
                connect: { id: projectId }
            },
            role: role,
        },
    });

    return res.status(200).json(adduser);

}

export const getUsersByProjectId = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const page = parseInt(req.query.page as string || '1')
    const page_size = parseInt(req.query.page_size as string || '10')
    const skip = (page - 1) * page_size;
    const { search } = req.query;

    try {
        const total_count = await prisma.user.count({
            where: {
                memberOf: {
                    some: {
                        projectId: parseInt(projectId)
                    }
                }
            }
        })

        const projectUser = await prisma.user.findMany({
            where: {
                memberOf: {
                    some: {
                        projectId: parseInt(projectId)
                    },
                },
                ...(search && {
                    email: {
                        contains: search.toString().toLowerCase()
                    }
                })
            },
            skip,
            take: page_size,
            orderBy: { id: 'desc' },
            include: {
                memberOf: {
                    where: {
                        projectId: parseInt(projectId)
                    },
                    select: {
                        role: true
                    }
                }
            }
        })

        const formatted = projectUser.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.memberOf[0]?.role || null, // extract role directly
        }));
        console.log(total_count);

        res.send({
            link: {
                next: total_count > skip + page_size ? `/projects/active?page=${page + 1}&page_size=${page_size}` : null,
                prev: page > 1 ? `/projects/active?page=${page - 1}&page_size=${page_size}` : null
            },
            total_count: total_count,
            page: page,
            page_size: page_size,
            data: formatted
        })
    } catch (error) {
        console.log('Error:', error);
    }
}

export const searchProjectUser = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: "Email query parameter is required" });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                email: {
                    contains: email.toString().toLowerCase(),
                },
                memberOf: {
                    some: {
                        projectId: parseInt(projectId)
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true
            },
            orderBy: { id: 'desc' }
        });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Error searching project users:", error);
        res.status(500).json({ message: "Failed to search project users", error });
    }
};
