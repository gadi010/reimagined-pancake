import "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        email: string;
      };
      query: {
        page?: string;
        page_size?: string;
        user?: string;
        status?: string;
        type?: string;
        search?: string;
      };
    }
  }
}

