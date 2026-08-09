export interface ThrottleControlFunctions {
  isPending(): boolean;
  cancel(): void;
  flush(): void;
}

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export type ThrottledState<Args extends any[]> = ((
  ...args: Args
) => void) & ThrottleControlFunctions;
