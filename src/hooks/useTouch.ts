import { useCallback, useRef } from 'react';

interface TouchHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
}

interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
  moved: boolean;
}

export const useTouch = <T extends HTMLElement>(
  handlers: TouchHandlers
) => {
  const touchDataRef = useRef<TouchData | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchDataRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      moved: false,
    };

    // Start long press timer
    if (handlers.onLongPress) {
      longPressTimerRef.current = window.setTimeout(() => {
        if (touchDataRef.current && !touchDataRef.current.moved) {
          handlers.onLongPress?.();
        }
      }, 500);
    }
  }, [handlers]);

  const handleTouchMove = useCallback(() => {
    if (touchDataRef.current) {
      touchDataRef.current.moved = true;
      
      // Clear long press timer on move
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchDataRef.current) return;

    // Clear long press timer
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchDataRef.current.startX;
    const deltaY = touch.clientY - touchDataRef.current.startY;
    const deltaTime = Date.now() - touchDataRef.current.startTime;
    const moved = touchDataRef.current.moved;

    // Minimum distance for swipe
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    if (!moved && deltaTime < 200) {
      // Tap gesture
      handlers.onTap?.();
    } else if (deltaTime < maxSwipeTime) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > minSwipeDistance && absX > absY) {
        // Horizontal swipe
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else if (absY > minSwipeDistance && absY > absX) {
        // Vertical swipe
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    }

    touchDataRef.current = null;
  }, [handlers]);

  const ref = useCallback((element: T | null) => {
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return ref;
};