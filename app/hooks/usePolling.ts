import { useEffect } from "react";

export function usePolling(callback: () => void, intervalMs: number = 3000, enabled: boolean = true) {
  // Use useCallback to memoize the callback if it isn't already,
  // but it's highly recommended the consumer memoizes it too to prevent infinite loops.
  
  useEffect(() => {
    if (!enabled) return;
    
    // Initial fetch
    callback();
    
    // Setup polling
    const id = setInterval(callback, intervalMs);
    
    // Cleanup
    return () => clearInterval(id);
  }, [callback, intervalMs, enabled]);
}
