
import { useRef, useCallback, MouseEvent, TouchEvent } from 'react';

interface UseDragScrollOptions {
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const useDragScroll = (options: UseDragScrollOptions = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    
    ref.current.style.cursor = 'grabbing';
    ref.current.style.userSelect = 'none';
    
    options.onDragStart?.();
  }, [options]);

  const handleMouseUp = useCallback(() => {
    if (!ref.current) return;
    
    isDragging.current = false;
    ref.current.style.cursor = 'grab';
    ref.current.style.userSelect = 'auto';
    
    options.onDragEnd?.();
    
    // Small delay to prevent click events when dragging has occurred
    if (hasMoved.current) {
      setTimeout(() => {
        hasMoved.current = false;
      }, 100);
    }
  }, [options]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    
    e.preventDefault();
    hasMoved.current = true;
    
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!ref.current) return;
    
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.touches[0].pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    
    options.onDragStart?.();
  }, [options]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !ref.current) return;
    
    hasMoved.current = true;
    
    const x = e.touches[0].pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    options.onDragEnd?.();
    
    // Small delay to prevent click events when dragging has occurred
    if (hasMoved.current) {
      setTimeout(() => {
        hasMoved.current = false;
      }, 100);
    }
  }, [options]);

  const getDragProps = useCallback(() => ({
    ref,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    style: { cursor: 'grab' },
  }), [handleMouseDown, handleMouseUp, handleMouseMove, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const isDragActive = () => hasMoved.current;

  return { getDragProps, isDragActive };
};
