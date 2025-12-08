export interface IUser {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  work: IWork[];
  projects: IProject[];
  providers: IProvider[];
  workAssignees: IWorkAssignee[];
  memberOf: IProjectMember[];
}

export interface IProvider {
  id: number;
  name: string;
  accessToken: string;
  email: string;
  userId: number;
  user: IUser;
}

export interface IProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role?: string;
  project: IProject;
  user: IUser;
}

export interface IProject {
  id: number;
  title: string;
  description?: string;
  dueDate?: Date | null;
  createdById?: number;
  createdBy?: IUser;
  members?: IProjectMember[];
  works?: IWork[];
  createdAt?: Date;
  updatedAt?: Date;
  githubRepoId?: number;
  github?: IGithubRepo;
}

export interface IGithubRepo {
  id: number;
  repoId: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  description?: string;
  ownerLogin: string;
  ownerId: number;
  webhook?: string;
  createdAt: Date;
  updatedAt: Date;
  projects: IProject[];
}

export interface IWork {
  id: number;
  title: string;
  description?: string | null;
  type: string;
  projectId?: number;
  project?: IProject;
  createById?: number;
  createBy?: IUser;
  assignees?: any;
  status: string;
  progress?: number | null;
  attachments?: IAttachment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWorkAssignee {
  id: number;
  workId: number;
  work: IWork;
  userId: number;
  user: IUser;
  role: string;
}

export interface IAttachment {
  id: number;
  workId: number;
  work: IWork;
  url: string;
  filename: string;
  createdAt: Date;
}

