import { useRef, useEffect, useCallback, useState } from 'react'
import { gsap } from 'gsap'

const DEFAULT_PARTICLE_COUNT = 6
const DEFAULT_GLOW_COLOR = '255, 107, 53' // Orange theme

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div')
  el.className = 'particle'
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `
  return el
}

const MagicButton = ({
  children,
  className = '',
  style = {},
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = true,
  enableMagnetism = false,
  disableAnimations = false,
  ...props
}) => {
  const buttonRef = useRef(null)
  const particlesRef = useRef([])
  const timeoutsRef = useRef([])
  const isHoveredRef = useRef(false)
  const memoizedParticles = useRef([])
  const particlesInitialized = useRef(false)
  const magnetismAnimationRef = useRef(null)

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !buttonRef.current) return
    const { width, height } = buttonRef.current.getBoundingClientRect()
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    )
    particlesInitialized.current = true
  }, [particleCount, glowColor])

  const clearAllParticles = useCallback(() => {
    try {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
      magnetismAnimationRef.current?.kill()
      particlesRef.current.forEach(particle => {
        if (typeof gsap !== 'undefined') {
          gsap.to(particle, {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'back.in(1.7)',
            onComplete: () => {
              particle.parentNode?.removeChild(particle)
            }
          })
        } else {
          particle.parentNode?.removeChild(particle)
        }
      })
      particlesRef.current = []
    } catch (error) {
      console.error('Error in clearAllParticles:', error)
    }
  }, [])

  const animateParticles = useCallback(() => {
    try {
      if (!buttonRef.current || !isHoveredRef.current) return
      if (!particlesInitialized.current) {
        initializeParticles()
      }
      if (typeof gsap === 'undefined') {
        console.warn('GSAP is not available, particle animations disabled')
        return
      }
      memoizedParticles.current.forEach((particle, index) => {
        const timeoutId = setTimeout(() => {
          try {
            if (!isHoveredRef.current || !buttonRef.current) return
            const clone = particle.cloneNode(true)
            buttonRef.current.appendChild(clone)
            particlesRef.current.push(clone)
            gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' })
            gsap.to(clone, {
              x: (Math.random() - 0.5) * 50,
              y: (Math.random() - 0.5) * 50,
              rotation: Math.random() * 360,
              duration: 2 + Math.random() * 2,
              ease: 'none',
              repeat: -1,
              yoyo: true
            })
            gsap.to(clone, {
              opacity: 0.3,
              duration: 1.5,
              ease: 'power2.inOut',
              repeat: -1,
              yoyo: true
            })
          } catch (error) {
            console.error('Error animating particle:', error)
          }
        }, index * 100)
        timeoutsRef.current.push(timeoutId)
      })
    } catch (error) {
      console.error('Error in animateParticles:', error)
    }
  }, [initializeParticles])

  useEffect(() => {
    if (disableAnimations || !buttonRef.current) return
    const element = buttonRef.current
    const handleMouseEnter = () => {
      try {
        isHoveredRef.current = true
        animateParticles()
        if (enableTilt && typeof gsap !== 'undefined') {
          gsap.to(element, {
            rotateX: 2,
            rotateY: 2,
            duration: 0.3,
            ease: 'power2.out',
            transformPerspective: 1000
          })
        }
      } catch (error) {
        console.error('Error in handleMouseEnter:', error)
      }
    }
    const handleMouseLeave = () => {
      try {
        isHoveredRef.current = false
        clearAllParticles()
        if (enableTilt && typeof gsap !== 'undefined') {
          gsap.to(element, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.3,
            ease: 'power2.out'
          })
        }
        if (enableMagnetism && typeof gsap !== 'undefined') {
          gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          })
        }
      } catch (error) {
        console.error('Error in handleMouseLeave:', error)
      }
    }
    const handleMouseMove = e => {
      try {
        if (!enableTilt && !enableMagnetism) return
        if (typeof gsap === 'undefined') return
        const rect = element.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        if (enableTilt) {
          const rotateX = ((y - centerY) / centerY) * -5
          const rotateY = ((x - centerX) / centerX) * 5
          gsap.to(element, {
            rotateX,
            rotateY,
            duration: 0.1,
            ease: 'power2.out',
            transformPerspective: 1000
          })
        }
        if (enableMagnetism) {
          const magnetX = (x - centerX) * 0.03
          const magnetY = (y - centerY) * 0.03
          magnetismAnimationRef.current = gsap.to(element, {
            x: magnetX,
            y: magnetY,
            duration: 0.3,
            ease: 'power2.out'
          })
        }
      } catch (error) {
        console.error('Error in handleMouseMove:', error)
      }
    }
    const handleClick = e => {
      try {
        if (!clickEffect) return
        const rect = element.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const maxDistance = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height)
        )
        const ripple = document.createElement('div')
        ripple.style.cssText = `
          position: absolute;
          width: ${maxDistance * 2}px;
          height: ${maxDistance * 2}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
          left: ${x - maxDistance}px;
          top: ${y - maxDistance}px;
          pointer-events: none;
          z-index: 1000;
        `
        element.appendChild(ripple)
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(
            ripple,
            {
              scale: 0,
              opacity: 1
            },
            {
              scale: 1,
              opacity: 0,
              duration: 0.8,
              ease: 'power2.out',
              onComplete: () => ripple.remove()
            }
          )
        } else {
          setTimeout(() => ripple.remove(), 800)
        }
      } catch (error) {
        console.error('Error in handleClick:', error)
      }
    }
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('click', handleClick)
    return () => {
      isHoveredRef.current = false
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('click', handleClick)
      clearAllParticles()
    }
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor])

  return (
    <button
      ref={buttonRef}
      className={`magic-button ${className}`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      {...props}
    >
      {children}
    </button>
  )
}

export default MagicButton

