declare module 'indeed-job-scraper' {
    interface Job {
      title: string;
      company: string;
      location: string;
      description: string;
    }
  
    interface GetJobsListParams {
      query: string;
      location: string;
      fromdays?: number;
      sort?: string;
      maxperpage?: number;
    }
  
    export function getJobsList(params: GetJobsListParams): Promise<Job[]>;
    export function release(): void;
  }