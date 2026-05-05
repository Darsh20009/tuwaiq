import { useState, useEffect } from "react";

/**
 * Returns true only when the current browser supports Apple Pay
 * (Safari on iOS / macOS with a wallet set up).
 * Uses window.ApplePaySession — Apple's official detection API.
 */
export function useIsAppleDevice(): boolean {
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        if (
          typeof window !== "undefined" &&
          "ApplePaySession" in window &&
          (window as any).ApplePaySession?.canMakePayments()
        ) {
          setIsApple(true);
        }
      } catch {
        setIsApple(false);
      }
    };
    check();
  }, []);

  return isApple;
}
