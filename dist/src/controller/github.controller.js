import axios from "axios";
import prisma from "../lib/prisma.js";
import { getFilter } from "../components/get-work-counts.js";
export const getGithubRepo = async (req, res) => {
    const userId = parseInt(req.user.userId);
    try {
        const provider = await prisma.provider.findFirst({
            where: { id: userId },
            select: {
                accessToken: true,
            },
        });
        console.log('| provider |', provider);
        if (!provider)
            return res.status(400).json({ error: "GitHub not connected" });
        try {
            const response = await axios.get('https://api.github.com/user/repos', {
                headers: {
                    Authorization: `token ${provider.accessToken}`,
                },
            });
            return res.status(200).json({ repositories: response.data });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch GitHub repositories', error: error });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error', errorMessage: error.message });
    }
};
export const createGithubRepo = async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const userId = parseInt(req.user.userId);
    const { repoId, name, fullName, private: is_private, htmlUrl, description, ownerLogin, ownerId, webhook, } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                providers: true,
            },
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const hasGithubProvider = user.providers.find(p => p.name === "github");
        if (!hasGithubProvider)
            return res.status(400).json({ error: "GitHub not connected" });
        try {
            const response = await axios.post(webhook, {
                name: "web",
                active: true,
                events: ["push"],
                config: {
                    url: `${process.env.API_URL}/github/webhook`,
                    content_type: "json",
                    insecure_ssl: "0",
                },
            }, {
                headers: {
                    Authorization: `token ${hasGithubProvider.accessToken}`,
                    Accept: "application/vnd.github+json",
                },
            });
            console.log("✅ Webhook created successfully:", response.data);
        }
        catch (error) {
            const errMsg = error.response?.data?.errors?.[0]?.message;
            if (errMsg === "Hook already exists on this repository") {
                console.log("⚠️ Webhook already exists — skipping creation.");
            }
            else {
                console.error("❌ Error creating webhook:", error.response ? error.response.data : error.message);
                return res.status(500).json({
                    error: "Failed to create webhook on GitHub",
                    errorMessage: error.message,
                });
            }
        }
        const createRepo = await prisma.githubRepo.create({
            data: {
                repoId,
                name,
                fullName,
                private: is_private,
                htmlUrl,
                description,
                ownerLogin,
                ownerId,
                webhook,
                projects: {
                    connect: { id: projectId },
                },
            },
        });
        return res.status(201).json({
            message: "GitHub repo linked successfully",
            repo: createRepo,
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Internal Server Error",
            errorMessage: error.message,
        });
    }
};
export const handleWebhook = async (req, res) => {
    try {
        const event = req.headers["x-github-event"];
        if (event !== "push") {
            console.log(`⚠️ Ignoring non-push event: ${event}`);
            return res.status(200).json({ message: "Event not handled" });
        }
        const { commits, pusher, repository } = req.body;
        console.log(`📦 Webhook received from repo: ${repository.full_name}`);
        console.log(`👤 Pushed by: ${pusher.name} (${pusher.email})`);
        const user = await prisma.user.findUnique({
            where: { email: pusher.email },
        });
        if (!user) {
            console.log(`❌ No matching user for email: ${pusher.email}`);
            return res.status(200).send("No user match");
        }
        let unmatchedCommits = [];
        for (const commit of commits) {
            console.log(`\n📝 Processing commit: ${commit.message}`);
            const parsed = getFilter(commit.message);
            if (!parsed) {
                console.log(`⚠️ Skipped commit (invalid format): ${commit.message}`);
                unmatchedCommits.push(commit.message);
                continue;
            }
            const { id, type, status } = parsed;
            console.log(`➡️ Parsed as: id=${id}, type=${type}, status=${status}`);
            const updated = await prisma.work.updateMany({
                where: {
                    id,
                    type,
                    assignees: {
                        some: { userId: user.id },
                    },
                },
                data: {
                    status,
                    updatedAt: new Date(),
                },
            });
            if (updated.count === 0) {
                console.log(`❌ No matching work found for commit: ${commit.message}`);
                unmatchedCommits.push(commit.message);
            }
            else {
                console.log(`✅ Work #${id} updated to ${status}`);
            }
        }
        if (unmatchedCommits.length > 0) {
            console.log(`⚠️ ${unmatchedCommits.length} commit(s) didn't match any work:`, unmatchedCommits);
            // TODO: Optional - send in-app or email notification
            // await sendNotification({
            //   userId: user.id,
            //   message: `Some commits didn't match any tasks: ${unmatchedCommits.join(", ")}`
            // });
        }
        res.status(200).json({ success: true, unmatched: unmatchedCommits });
    }
    catch (err) {
        console.error("💥 Webhook error:", err);
        res.status(500).send("Error processing webhook");
    }
};
