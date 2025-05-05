import React from 'react';

interface UseSingletonTimeoutReturn {
  setInterval(cb: () => void, interval: number): void;
  setTimeout(cb: () => void, timeout: number): void;
  clearInterval(): void;
  clearTimeout(): void;
}

export function useSingletonTimeout(): UseSingletonTimeoutReturn {
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const intervalRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  React.useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timeoutRef.current);
    };
  }, []);
  return {
    setInterval: React.useCallback((cb: () => void, interval: number) => {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(cb, interval);
    }, []),
    clearInterval: React.useCallback(() => {
      clearInterval(intervalRef.current);
    }, []),
    setTimeout: React.useCallback((cb: () => void, timeout: number) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(cb, timeout);
    }, []),
    clearTimeout: React.useCallback(() => {
      clearInterval(intervalRef.current);
    }, []),
  };
}

interface PollingLimitProps {
  /** How many times has the polling callback been called? */
  times: number;
  /** How many milliseconds have passed since polling started? */
  millis: number;
}
interface UsePollingProps {
  /** How many times can the callback be invoked? If this is a callback, it should return a boolean that indicates whether the polling should continue or not. You should probably use refs to refer to any variable inside this. */
  limit?:
    | Partial<PollingLimitProps>
    | ((constraint: PollingLimitProps) => boolean);
  enabled?: boolean;
  /** Interval (in millis) between polling invocations */
  interval: number;
  /** If key is changed, the polling will be re-registered. We don't want to use fn as the useEffect dependency. */
  key?: any;

  fn(): void;
  callbacks?: {
    onStart?(): void;
    onEnd?(constraint: PollingLimitProps): void;
  };
}

export function usePolling(props: UsePollingProps) {
  const { fn, interval, limit, key, enabled = true, callbacks } = props;
  const { setInterval, clearInterval } = useSingletonTimeout();
  const startTime = React.useRef(Date.now());
  const times = React.useRef(0);
  const lock = React.useRef(false);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }
    startTime.current = Date.now();
    times.current = 0;
    callbacks?.onStart?.();

    function shouldContinue() {
      if (!limit) {
        return true;
      }
      const millis = Date.now() - startTime.current;
      let canContinue = false;
      if (typeof limit === 'function') {
        canContinue = limit({
          millis,
          times: times.current,
        });
      } else {
        const beyondTimeLimit = limit.millis != null && millis >= limit.millis;
        const beyondInvocationLimit =
          limit.times != null && times.current >= limit.times;
        canContinue = !beyondTimeLimit && !beyondInvocationLimit;
      }
      return canContinue;
    }

    function onEnd() {
      callbacks?.onEnd?.({
        millis: Date.now() - startTime.current,
        times: times.current,
      });
      clearInterval();
    }

    setInterval(async () => {
      if (lock.current) {
        return;
      }
      lock.current = true;

      try {
        await fn();
      } catch (e) {
        console.error(e);
      }
      times.current++;

      if (!shouldContinue()) {
        onEnd();
      }
      lock.current = false;
    }, interval);

    return clearInterval;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
}

interface PollingRendererProps {
  interval: number;
  children?(): React.ReactNode;
}

export function PollingRenderer(props: PollingRendererProps) {
  const [, flop] = React.useState(false);
  usePolling({
    fn: () => flop((flip) => !flip),
    interval: props.interval,
  });
  return props.children?.();
}
