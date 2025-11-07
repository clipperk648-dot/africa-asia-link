/**
 * Video Optimization Utilities
 * Handles efficient video loading, caching, and playback across the app
 */

interface VideoPreloadConfig {
  url: string;
  priority?: 'high' | 'medium' | 'low';
  autoplay?: boolean;
}

// Cache for preloaded videos
const videoCache = new Map<string, HTMLVideoElement>();

/**
 * Preload a video in the background without blocking rendering
 */
export const preloadVideo = (config: VideoPreloadConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { url, autoplay = true } = config;

    // Check if already cached
    if (videoCache.has(url)) {
      resolve();
      return;
    }

    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';

    const handleCanPlay = () => {
      videoCache.set(url, video);
      cleanup();
      resolve();
    };

    const handleError = () => {
      console.error(`Failed to preload video: ${url}`);
      cleanup();
      reject(new Error(`Failed to load video: ${url}`));
    };

    const cleanup = () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      if (!autoplay) {
        video.pause();
      }
    };

    video.addEventListener('canplay', handleCanPlay, { once: true });
    video.addEventListener('error', handleError, { once: true });

    // Start loading
    if (autoplay) {
      video.autoplay = true;
      video.play().catch(() => {
        // Autoplay might fail due to browser policies, that's okay
      });
    }
  });
};

/**
 * Preload multiple videos in parallel with priority queue
 */
export const preloadVideos = (configs: VideoPreloadConfig[]): Promise<PromiseSettledResult<void>[]> => {
  // Sort by priority
  const sorted = [...configs].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']);
  });

  // Preload with minimal stagger for true parallel loading
  return Promise.allSettled(
    sorted.map((config, index) =>
      new Promise<void>((resolve) => {
        // Minimal stagger (10ms) to prevent network blocking while enabling true parallelism
        setTimeout(() => {
          preloadVideo(config).then(resolve).catch(() => resolve());
        }, index * 10);
      })
    )
  );
};

/**
 * Get a cached video element
 */
export const getCachedVideo = (url: string): HTMLVideoElement | null => {
  return videoCache.get(url) || null;
};

/**
 * Clear video cache for a specific URL or all videos
 */
export const clearVideoCache = (url?: string): void => {
  if (url) {
    const video = videoCache.get(url);
    if (video) {
      video.pause();
      video.src = '';
      videoCache.delete(url);
    }
  } else {
    videoCache.forEach((video) => {
      video.pause();
      video.src = '';
    });
    videoCache.clear();
  }
};

/**
 * Optimize video element for playback
 */
export const optimizeVideoElement = (
  videoRef: HTMLVideoElement | null,
  options?: {
    preload?: 'none' | 'metadata' | 'auto';
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    playsInline?: boolean;
  }
): void => {
  if (!videoRef) return;

  const {
    preload = 'metadata',
    autoplay = true,
    muted = true,
    loop = true,
    playsInline = true,
  } = options || {};

  videoRef.preload = preload as 'none' | 'metadata' | 'auto';
  videoRef.autoplay = autoplay;
  videoRef.muted = muted;
  videoRef.loop = loop;
  videoRef.playsInline = playsInline;
  videoRef.crossOrigin = 'anonymous';

  // Ensure video loads
  if (preload === 'auto' && videoRef.paused) {
    videoRef.load();
    if (autoplay) {
      videoRef.play().catch(() => {
        // Autoplay may fail, that's okay
      });
    }
  }
};

/**
 * Pause all videos except the specified one
 */
export const pauseAllVideosExcept = (activeVideoRef: HTMLVideoElement | null): void => {
  document.querySelectorAll('video').forEach((video) => {
    if (video !== activeVideoRef && !video.paused) {
      video.pause();
    }
  });
};

/**
 * Get video load state
 */
export const getVideoLoadState = (
  videoRef: HTMLVideoElement | null
): { isLoaded: boolean; duration: number; currentTime: number } => {
  if (!videoRef) {
    return { isLoaded: false, duration: 0, currentTime: 0 };
  }

  return {
    isLoaded: videoRef.readyState >= 2, // HAVE_CURRENT_DATA
    duration: videoRef.duration || 0,
    currentTime: videoRef.currentTime || 0,
  };
};

/**
 * Handle video playback with error fallback
 */
export const playVideoSafely = async (videoRef: HTMLVideoElement | null): Promise<void> => {
  if (!videoRef) return;

  try {
    // Ensure video is loaded
    if (videoRef.readyState < 2) {
      videoRef.load();
    }

    const playPromise = videoRef.play();
    if (playPromise !== undefined) {
      await playPromise;
    }
  } catch (error) {
    console.error('Error playing video:', error);
    // Video might not be ready, will retry on next attempt
  }
};

/**
 * Batch preload videos from URLs at page load
 */
export const preloadCollectionVideos = (videoUrls: string[]): Promise<void> => {
  const configs = videoUrls.map((url, index) => ({
    url,
    priority: index === 0 ? ('high' as const) : ('medium' as const),
    autoplay: false,
  }));

  return preloadVideos(configs).then(() => {});
};
