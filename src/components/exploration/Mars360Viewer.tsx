import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Mars360ViewerProps {
  locationId?: string
  locationName?: string
  className?: string
}

export function Mars360Viewer({
  locationId = 'jezero-crater',
  locationName = 'Martian Surface',
  className = '',
}: Mars360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // 1. Three.js Scene, Camera & Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000)
    camera.position.set(0, 0, 0.1) // Inside the sphere

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // 2. Procedural High-Res Equirectangular Panorama Canvas
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')

    if (ctx) {
      const W = canvas.width
      const H = canvas.height

      // Palette based on location
      let skyTop = '#b85e3b'
      let skyHorizon = '#d98a68'
      let sunGlow = '#ffe0cc'
      let groundFar = '#944129'
      let groundNear = '#632514'
      let hasPolarIce = false
      let isHighAltitude = false

      if (locationId === 'olympus-mons' || locationId === 'tharsis-montes' || locationId === 'alba-mons') {
        // High altitude caldera: dark violet/purple sky with faint stars
        skyTop = '#140c24'
        skyHorizon = '#4a2538'
        groundFar = '#52342c'
        groundNear = '#2e1913'
        isHighAltitude = true
      } else if (locationId === 'planum-boreum' || locationId === 'planum-australe' || locationId === 'argyre-planitia') {
        // Polar frost & ice sheets
        skyTop = '#c79b85'
        skyHorizon = '#e8c9b7'
        groundFar = '#d4b8a8'
        groundNear = '#eedfd5'
        hasPolarIce = true
      } else if (locationId === 'valles-marineris' || locationId === 'noctis-labyrinthus' || locationId === 'kasei-valles') {
        // Deep canyon with morning haze
        skyTop = '#9c4c2d'
        skyHorizon = '#c77855'
        groundFar = '#85371f'
        groundNear = '#4d1a0c'
      }

      // Draw Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.52)
      skyGrad.addColorStop(0, skyTop)
      skyGrad.addColorStop(0.85, skyHorizon)
      skyGrad.addColorStop(1, '#e39d7b')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, W, H * 0.52)

      // Distant stars if high altitude
      if (isHighAltitude) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
        for (let i = 0; i < 180; i++) {
          const sx = Math.random() * W
          const sy = Math.random() * (H * 0.35)
          const sr = 0.5 + Math.random() * 1.5
          ctx.beginPath()
          ctx.arc(sx, sy, sr, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Martian Sun with blue sunset halo
      const sunX = W * 0.62
      const sunY = H * 0.36
      const sunHalo = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 140)
      sunHalo.addColorStop(0, '#ffffff')
      sunHalo.addColorStop(0.2, sunGlow)
      sunHalo.addColorStop(0.5, 'rgba(100, 160, 220, 0.45)') // Blue scattering
      sunHalo.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = sunHalo
      ctx.beginPath()
      ctx.arc(sunX, sunY, 140, 0, Math.PI * 2)
      ctx.fill()

      // Distant Mountain & Crater Rim Silhouette
      ctx.fillStyle = groundFar
      ctx.beginPath()
      ctx.moveTo(0, H * 0.52)
      for (let x = 0; x <= W; x += 16) {
        const normX = x / W
        const mntPeak = Math.sin(normX * Math.PI * 4) * 22 + Math.cos(normX * Math.PI * 9) * 14
        const y = H * 0.52 - Math.max(0, mntPeak)
        ctx.lineTo(x, y)
      }
      ctx.lineTo(W, H)
      ctx.lineTo(0, H)
      ctx.closePath()
      ctx.fill()

      // Ground Terrain Gradient
      const groundGrad = ctx.createLinearGradient(0, H * 0.52, 0, H)
      groundGrad.addColorStop(0, groundFar)
      groundGrad.addColorStop(0.4, groundNear)
      groundGrad.addColorStop(1, '#3b1206')
      ctx.fillStyle = groundGrad
      ctx.fillRect(0, H * 0.52, W, H * 0.48)

      // Polar Frost patches
      if (hasPolarIce) {
        ctx.fillStyle = 'rgba(240, 245, 255, 0.75)'
        for (let i = 0; i < 40; i++) {
          const px = Math.random() * W
          const py = H * 0.55 + Math.random() * (H * 0.42)
          const pw = 40 + Math.random() * 180
          const ph = 8 + Math.random() * 25
          ctx.beginPath()
          ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Rocks and Boulders in Foreground
      ctx.fillStyle = '#210c05'
      for (let i = 0; i < 120; i++) {
        const rx = Math.random() * W
        const groundDepth = Math.random()
        const ry = H * 0.55 + groundDepth * (H * 0.43)
        const size = (0.5 + groundDepth * 3) * (1.5 + Math.random() * 4)
        ctx.beginPath()
        ctx.ellipse(rx, ry, size * 1.6, size, Math.random() * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Rover Wheel Tracks in the red dust
      ctx.strokeStyle = 'rgba(30, 10, 4, 0.45)'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(W * 0.48, H)
      ctx.bezierCurveTo(W * 0.47, H * 0.85, W * 0.44, H * 0.72, W * 0.42, H * 0.58)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(W * 0.52, H)
      ctx.bezierCurveTo(W * 0.51, H * 0.85, W * 0.48, H * 0.72, W * 0.46, H * 0.58)
      ctx.stroke()
    }

    const panoramaTexture = new THREE.CanvasTexture(canvas)
    panoramaTexture.mapping = THREE.EquirectangularReflectionMapping
    panoramaTexture.colorSpace = THREE.SRGBColorSpace

    // Inverted 360 Sphere
    const sphereGeometry = new THREE.SphereGeometry(100, 64, 40)
    sphereGeometry.scale(-1, 1, 1) // Invert normals so texture is on the inside
    const sphereMaterial = new THREE.MeshBasicMaterial({ map: panoramaTexture })
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphereMesh)

    // 3. Interactive 360 Look Controls
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0
    let lon = 0
    let lat = 0
    let velocityX = 0
    let velocityY = 0

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
      velocityX = 0
      velocityY = 0
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY

      lon -= deltaX * 0.12
      lat += deltaY * 0.12
      lat = Math.max(-85, Math.min(85, lat)) // Clamp vertical pitch

      velocityX = -deltaX * 0.08
      velocityY = deltaY * 0.08

      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onPointerUp = () => {
      isDragging = false
    }

    const onWheel = (e: WheelEvent) => {
      camera.fov = Math.max(35, Math.min(95, camera.fov + e.deltaY * 0.05))
      camera.updateProjectionMatrix()
    }

    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    container.addEventListener('wheel', onWheel)

    // 4. Render Loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)

      // Damping inertia
      if (!isDragging) {
        lon += velocityX
        lat += velocityY
        lat = Math.max(-85, Math.min(85, lat))
        velocityX *= 0.92
        velocityY *= 0.92
      }

      // Convert spherical angles to camera lookAt target
      const phi = THREE.MathUtils.degToRad(90 - lat)
      const theta = THREE.MathUtils.degToRad(lon)

      const targetX = Math.sin(phi) * Math.cos(theta)
      const targetY = Math.cos(phi)
      const targetZ = Math.sin(phi) * Math.sin(theta)

      camera.lookAt(targetX, targetY, targetZ)
      renderer.render(scene, camera)
    }
    animate()

    // 5. Resize
    const handleResize = () => {
      if (!containerRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      container.removeEventListener('wheel', onWheel)
      renderer.dispose()
      sphereGeometry.dispose()
      sphereMaterial.dispose()
      panoramaTexture.dispose()
      if (renderer.domElement) renderer.domElement.remove()
    }
  }, [locationId])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden ${className}`}
    >
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none flex items-center gap-2.5 bg-[#10141a]/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 text-xs text-neutral-300">
        <span className="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse" />
        <span>360° Panorama: Click & Drag to inspect {locationName}</span>
      </div>
    </div>
  )
}
