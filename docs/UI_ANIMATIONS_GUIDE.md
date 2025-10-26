# UI Animations and Visual Improvements Guide

This guide documents all animation components and best practices for creating smooth, performant UI animations in the Echina application.

## Table of Contents

1. [Animation Components](#animation-components)
2. [Built-in Animations](#built-in-animations)
3. [Best Practices](#best-practices)
4. [Performance Considerations](#performance-considerations)
5. [Browser Compatibility](#browser-compatibility)

## Animation Components

### PageTransition

Provides smooth fade-in animation for page content.

```tsx
import PageTransition from "@/components/PageTransition";

<PageTransition duration={600} delay={0}>
  <Dashboard />
</PageTransition>
```

**Props:**
- `children` - Content to animate
- `duration` - Animation duration in ms (default: 600)
- `delay` - Delay before animation starts in ms (default: 0)
- `className` - Additional CSS classes

**Variants:**
- `PageTransition` - Fade effect
- `ScaleTransition` - Fade + scale effect
- `SlideTransition` - Slide effect (up/down/left/right)
- `StaggerTransition` - Multiple items with staggered timing

### LoadingSkeleton

Animated skeleton loaders for content placeholders.

```tsx
import LoadingSkeleton, { 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonList 
} from "@/components/LoadingSkeleton";

// Text skeleton
<LoadingSkeleton variant="text" count={3} />

// Card skeleton
<LoadingSkeleton variant="card" />

// Grid of cards
<SkeletonCard count={3} />

// Table skeleton
<SkeletonTable rows={5} columns={4} />

// List skeleton
<SkeletonList count={5} />
```

**Variants:**
- `text` - Multiple text lines
- `card` - Card placeholder
- `image` - Image placeholder
- `button` - Button placeholder
- `circle` - Circle placeholder

### AnimatedCard

Card component with entrance and hover animations.

```tsx
import AnimatedCard, { AnimatedCardGrid } from "@/components/AnimatedCard";

<AnimatedCard 
  hover="lift" 
  animate="slide-up"
  variant="gradient"
  delay={0.1}
>
  Card content
</AnimatedCard>

// Grid of cards
<AnimatedCardGrid 
  items={[item1, item2, item3]}
  columns={3}
  hover="lift"
  animate="slide-up"
  itemDelay={0.1}
/>
```

**Props:**
- `hover` - Hover effect: `lift`, `scale`, `glow`, `scale-glow`
- `animate` - Entrance animation: `fade`, `slide-up`, `scale-in`, `bounce`
- `variant` - Visual style: `default`, `gradient`, `glass`, `neon`
- `delay` - Animation delay in seconds

### AnimatedProgress

Smooth progress indicators and loaders.

```tsx
import AnimatedProgress, {
  CircularProgress,
  DotLoader,
  SkeletonLoader,
  LineLoader
} from "@/components/AnimatedProgress";

// Linear progress
<AnimatedProgress 
  value={65} 
  variant="gradient" 
  label="Loading..." 
  showValue 
/>

// Circular progress
<CircularProgress 
  value={75} 
  variant="success"
  size={100}
/>

// Loading indicators
<DotLoader size="md" />
<LineLoader />
<SkeletonLoader />
```

**Progress Variants:**
- `default` - Primary color
- `gradient` - Gradient from primary to accent
- `success` - Green
- `warning` - Yellow
- `error` - Red

### RippleButton

Button with material design ripple effect.

```tsx
import RippleButton from "@/components/RippleButton";

<RippleButton variant="default" size="lg">
  Click me
</RippleButton>
```

### OptimizedImage

Image component with lazy loading and responsive formats.

```tsx
import OptimizedImage from "@/components/OptimizedImage";

<OptimizedImage
  src="/images/product.jpg"
  webp="/images/product.webp"
  avif="/images/product.avif"
  alt="Product"
  width={400}
  height={300}
  quality={80}
/>
```

## Built-in Animations

### Utility Classes (in App.css)

All animations are available as Tailwind-like utility classes:

```tsx
// Entrance animations
<div className="animate-fade-in">Fade in</div>
<div className="animate-slide-up">Slide up</div>
<div className="animate-slide-down">Slide down</div>
<div className="animate-slide-left">Slide left</div>
<div className="animate-slide-right">Slide right</div>
<div className="animate-scale-in">Scale in</div>

// Continuous animations
<div className="animate-float">Float up and down</div>
<div className="animate-pulse-glow">Pulsing glow</div>
<div className="animate-shimmer">Shimmer effect</div>
<div className="animate-gradient-shift">Gradient shift</div>
<div className="animate-rotate">Continuous rotation</div>
<div className="animate-bounce-subtle">Subtle bounce</div>

// Hover effects
<div className="hover-scale">Scale on hover</div>
<div className="hover-lift">Lift on hover</div>
<div className="hover-glow">Glow on hover</div>

// Transitions
<div className="transition-smooth">Smooth transitions</div>
<div className="transition-fast">Fast transitions</div>
<div className="transition-slow">Slow transitions</div>
```

### Staggered Animations

Apply stagger effect to list items:

```tsx
<div className="space-y-4">
  <div className="animate-stagger">Item 1</div>
  <div className="animate-stagger">Item 2</div>
  <div className="animate-stagger">Item 3</div>
</div>

<!-- With custom delay -->
<div style={{ animationDelay: '0.1s' }} className="animate-slide-up">
  Item 1
</div>
```

### Glass Effect

Glassmorphism design with blur and transparency:

```tsx
<div className="glass-effect">
  Glass effect content
</div>

<div className="glass-effect-hover">
  Hover for enhanced glass effect
</div>
```

## Best Practices

### 1. Performance

- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `position` if possible
- Use `will-change` for complex animations
- Test on low-end devices

```tsx
// ✅ Good - GPU accelerated
<div style={{ animation: 'slideUp 0.6s ease-out' }}>
  Content
</div>

// ❌ Avoid - CPU intensive
<div style={{ animation: 'change-height 0.6s ease-out' }}>
  Content
</div>
```

### 2. Accessibility

- Respect `prefers-reduced-motion` setting
- Use meaningful animations, avoid excessive motion
- Ensure animations don't interfere with readability
- Provide alternative experiences for users with motion sensitivity

```tsx
// App.css already includes:
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3. Timing

- Keep animations short (200-600ms for transitions)
- Use consistent timing across similar elements
- Stagger animations for better visual flow
- Use easing functions for natural motion

**Easing Functions:**
- `ease-out` - Fast start, slow end (entrances)
- `ease-in` - Slow start, fast end (exits)
- `ease-in-out` - Slow start and end (continuous)
- `ease-linear` - Constant speed (progress bars)

### 4. Composition

- Break animations into smaller, reusable components
- Combine animations for complex effects
- Use stagger for lists
- Stack animations for depth

```tsx
// Combine entrance and hover animations
<AnimatedCard 
  animate="slide-up"
  hover="lift"
  variant="gradient"
>
  Content
</AnimatedCard>
```

## Performance Considerations

### Animation Performance Tips

1. **Use CSS animations instead of JavaScript**
   - CSS animations run on GPU
   - More performant for continuous motion

2. **Optimize transform properties**
   - Use `transform` instead of `position`
   - Use `opacity` instead of `visibility`

3. **Reduce animation complexity**
   - Fewer animated elements = better performance
   - Simplify animations on mobile devices

4. **Monitor bundle size**
   - Some animations increase CSS file size
   - Balance visual appeal with performance

### Performance Metrics

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3s

Test animations with:
- Chrome DevTools Performance tab
- WebPageTest
- Lighthouse

## Browser Compatibility

### Supported Browsers

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- Mobile browsers: Full support with fallbacks

### Graceful Degradation

For unsupported features, provide fallbacks:

```tsx
<div className="animate-fade-in" style={{ animation: 'fadeIn 0.6s ease-out' }}>
  Content with fallback
</div>
```

## Animation Checklist

- [ ] All animations are smooth and performant
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Loading states have visual feedback
- [ ] Page transitions are smooth
- [ ] Hover effects are subtle but noticeable
- [ ] Staggered animations have consistent timing
- [ ] Bundle size impact is acceptable
- [ ] Animations tested on low-end devices
- [ ] Mobile performance is acceptable
- [ ] Accessibility requirements are met

## Resources

- [MDN Web Docs: CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Web.dev: Animation Performance](https://web.dev/animations-guide/)
- [CSS Tricks: Animation Performance](https://css-tricks.com/animation-performance/)
- [Accessible Animations](https://www.a11y-101.com/design/animations)

## Troubleshooting

### Animations are jittery
- Check for layout thrashing
- Use `will-change` sparingly
- Test on actual devices

### Animations are slow
- Simplify animation complexity
- Use fewer animated elements
- Profile with DevTools

### Animations skip or stutter
- Reduce number of simultaneous animations
- Use CSS animations instead of JavaScript
- Check CPU usage

### Accessibility issues
- Ensure `prefers-reduced-motion` is respected
- Test with screen readers
- Verify keyboard navigation
