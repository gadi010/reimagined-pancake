import { IProvider, IUser, IWorkAssignee } from "../types/controllers.js";

export interface IUserProfile {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    userProjects: number;
}

export interface IGithubUser extends IUser, IProvider { }

export interface ProjectDeadlineDTO {
    id: number;
    name: string;
    progress: number;
    dueDate: Date | null;
}
export interface IWorkDTO {
    title: string;
    description: string;
    assignee: IWorkAssignee[];
    type: string;
    status?: string;
}