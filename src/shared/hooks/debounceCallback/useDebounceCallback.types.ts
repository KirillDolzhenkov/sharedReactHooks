export interface ControlFunctions {
  isPending(): boolean;
  cancel(): void;
  flush(): void;
}

export type DebouncedState<Args extends any[]> = ((
  ...args: Args
) => void) & ControlFunctions;
