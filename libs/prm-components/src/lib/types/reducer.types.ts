// This file shouldn't live within this lib, but it is the best place for now

export enum SubmitStatus {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type State<T> = {
  status: SubmitStatus;
  data?: T;
  error?: Error;
};

export type Action<T> =
  | {
      type: SubmitStatus.IDLE;
    }
  | {
      type: SubmitStatus.SUBMITTING;
    }
  | {
      type: SubmitStatus.SUCCESS;
      data: T;
    }
  | {
      type: SubmitStatus.ERROR;
      data: Error;
    };
