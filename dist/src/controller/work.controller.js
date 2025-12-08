import prisma from "../lib/prisma.js";
export const createWork = async (req, res) => {
    try {
        const { title, description, assignee, type } = req.body;
        const { userId } = req.user; // The creator
        const { projectId } = req.params;
        // Validate required fields
        if (!title || !description || !projectId || !assignee || !type) {
            return res.status(400).json({
                error: "Missing required fields",
                missing: [
                    !title && "title",
                    !description && "description",
                    !projectId && "projectId",
                    !assignee && "assignee",
                    !type && "type",
                ].filter(Boolean),
            });
        }
        // Create Work
        const work = await prisma.work.create({
            data: {
                title,
                description,
                type,
                project: {
                    connect: { id: parseInt(projectId) },
                },
                createBy: {
                    connect: { id: parseInt(userId) },
                },
                status: "untouched",
                assignees: {
                    create: assignee.map((assignee) => ({
                        user: { connect: { id: parseInt(assignee.id.toString()) } },
                        role: "ASSIGNEE",
                    })),
                },
            },
            include: {
                project: true,
                createBy: true,
                assignees: { include: { user: true } },
            },
        });
        return res.status(201).json(work);
    }
    catch (error) {
        console.error("Error creating work:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Invalid project or assignee ID" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};
export const updateWork = async (req, res) => {
    const { workId } = req.params;
    const { title, description, type, status, assignee } = req.body;
    try {
        if (!title || !description || !type || !assignee) {
            return res.status(400).json({
                error: "Missing required fields",
                missing: [
                    !title && "title",
                    !description && "description",
                    !type && "type",
                ].filter(Boolean),
            });
        }
        const work = await prisma.work.update({
            where: {
                id: parseInt(workId)
            },
            data: {
                title,
                description,
                type,
                status: status,
                assignees: {
                    deleteMany: {},
                    create: assignee.map(a => ({
                        user: { connect: { id: parseInt(a.id.toString()) } },
                        role: "ASSIGNEE",
                    })),
                },
            },
            include: {
                project: true,
                createBy: true,
                assignees: { include: { user: true } },
            },
        });
        return res.status(201).json(work);
    }
    catch (error) {
        console.log("Err:", error);
    }
};
export const getWorks = async (req, res) => {
    const { projectId } = req.params;
    const page = parseInt(req.query.page?.toString() || '1');
    const page_size = parseInt(req.query.page_size?.toString() || '10');
    const skip = (page - 1) * page_size;
    const userId = parseInt(req.query.user?.toString() || '0');
    const status = req.query.status?.toString();
    const type = req.query.type?.toString();
    const search = req.query.search?.toString();
    try {
        const total_count = await prisma.work.count({
            where: {
                projectId: parseInt(projectId)
            }
        });
        const works = await prisma.work.findMany({
            where: {
                projectId: parseInt(projectId),
                ...(userId && {
                    assignees: {
                        some: { userId: userId }
                    }
                }),
                ...(type && {
                    type: type
                }),
                ...(status && {
                    status: status
                }),
                ...(search && {
                    title: {
                        contains: search.toString().toLowerCase(),
                    }
                }),
            },
            skip,
            take: page_size,
            orderBy: { id: 'desc' },
            include: {
                assignees: {
                    select: {
                        user: true
                    }
                }
            }
        });
        const formattedWorks = works.map(work => ({
            ...work,
            assignees: work.assignees?.map((a) => a.user) ?? [],
        }));
        return res.send({
            link: {
                next: total_count > skip + page_size ? `/projects/active?page=${page + 1}&page_size=${page_size}` : null,
                prev: page > 1 ? `/projects/active?page=${page - 1}&page_size=${page_size}` : null
            },
            total_count: works,
            page: page,
            page_size: page_size,
            data: formattedWorks
        });
    }
    catch (error) {
        console.log('error', error);
        return res.status(500).json(error);
    }
};
export const deleteWork = async (req, res) => {
    const { workId } = req.params;
    try {
        const deleteWork = await prisma.work.delete({
            where: {
                id: parseInt(workId)
            }
        });
        res.send(deleteWork);
    }
    catch (error) {
        console.log('error:', error);
    }
};
export const getWorkStats = async (req, res) => {
    const { projectId } = req.params;
    const intPro = parseInt(projectId);
    try {
        // Fetch project info
        const project = await prisma.project.findUnique({
            where: { id: intPro },
            select: {
                id: true,
                title: true,
                description: true,
            },
        });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        const allWorks = await prisma.work.findMany({ where: { projectId: intPro }, select: { type: true, status: true } });
        const counts = {
            totalWorkCount: 0,
            completedWorkCount: 0,
            inProgressWorkCount: 0,
            untouchedWorkCount: 0,
            taskCount: 0,
            featureCount: 0,
            bugCount: 0,
        };
        const statusMap = {
            completed: "completedWorkCount",
            in_progress: "inProgressWorkCount",
            untouched: "untouchedWorkCount",
        };
        const typeMap = {
            task: "taskCount",
            feature: "featureCount",
            bug: "bugCount",
        };
        allWorks.forEach(work => {
            counts.totalWorkCount += 1;
            const statusKey = statusMap[work.status];
            if (statusKey)
                counts[statusKey] += 1;
            const typeKey = typeMap[work.type];
            if (typeKey)
                counts[typeKey] += 1;
        });
        const progress = counts.totalWorkCount > 0
            ? Math.round((counts.completedWorkCount / counts.totalWorkCount) * 100)
            : 0;
        // Stats array
        // const stats = [
        //   { title: "Total Work ", count: total_work_count },
        //   { title: "Completed Work ", count: total_completed_work_count },
        //   { title: "In Progress Work ", count: in_progress_work_count },
        //   { title: "Untouched Work ", count: untouched_work_count },
        //   { title: "Task ", count: task_count },
        //   { title: "Feature ", count: feature_count },
        //   { title: "Bug ", count: bug_count },
        // ];
        const stats = [
            { title: "Total Work", count: counts.totalWorkCount },
            { title: "Completed Work", count: counts.completedWorkCount },
            { title: "In Progress Work", count: counts.inProgressWorkCount },
            { title: "Untouched Work", count: counts.untouchedWorkCount },
            { title: "Task", count: counts.taskCount },
            { title: "Feature", count: counts.featureCount },
            { title: "Bug", count: counts.bugCount },
        ];
        return res.status(200).json({
            project: {
                title: project.title,
                description: project.description,
                progress, // 0 - 100%
            },
            stats,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
};
