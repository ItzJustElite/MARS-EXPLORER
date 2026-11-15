import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MARS_POIS, type MarsPOI } from '@/data/marsPois'

interface MarsCanvasProps {
  selectedPoi: MarsPOI | null
  onSelectPoi: (poi: MarsPOI) => void
  isInteractive?: boolean
  autoRotate?: boolean
  rotationSpeed?: number
  onScreenPointUpdate?: (point: { x: number; y: number; isVisible: boolean } | null) => void
  guessMode?: boolean
  onPlayerGuess?: (coords: { lat: number; lon: number }) => void
  playerGuessCoords?: { lat: number; lon: number } | null
  revealedPoi?: MarsPOI | null
}

const MARS_RADIUS = 2.5

// Convert Lat/Lon to 3D Cartesian coordinates on sphere
export function latLonToVector3(lat: number, lon: number, radius = MARS_RADIUS): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

// Convert 3D Cartesian point on sphere back to Lat/Lon
export function vector3ToLatLon(vec: THREE.Vector3): { lat: number; lon: number } {
  const normalized = vec.clone().normalize()
  const lat = 90 - Math.acos(normalized.y) * (180 / Math.PI)
  let lon = (Math.atan2(normalized.z, -normalized.x) * (180 / Math.PI)) - 180
  while (lon < -180) lon += 360
  while (lon > 180) lon -= 360
  return { lat, lon }
}

export function MarsCanvas({
  selectedPoi,
  onSelectPoi,
  isInteractive = true,
  autoRotate = true,
  rotationSpeed = 0.3,
  onScreenPointUpdate,
  guessMode = false,
  onPlayerGuess,
  playerGuessCoords,
  revealedPoi,
}: MarsCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loadProgress, setLoadProgress] = useState<number>(0)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const marsGroupRef = useRef<THREE.Group | null>(null)
  const markerMeshesRef = useRef<Map<string, THREE.Group>>(new Map())
  const guessMarkerRef = useRef<THREE.Group | null>(null)
  const arcLineRef = useRef<THREE.Line | null>(null)

  // Interaction & rotation state
  const isDraggingRef = useRef<boolean>(false)
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const rotationVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null)
  const isUserInteractingRef = useRef<boolean>(false)

  // Smoothly align Mars to face selected POI
  const rotateToPoi = useCallback((poi: MarsPOI) => {
    if (!marsGroupRef.current) return

    // We want POI to align with vector (0, 0, 1) facing the camera
    const phi = (90 - poi.lat) * (Math.PI / 180)
    const theta = (poi.lon + 180) * (Math.PI / 180)

    targetRotationRef.current = {
      x: phi - Math.PI / 2,
      y: -theta + Math.PI / 2,
    }
  }, [])

  // Auto-focus on selected POI when it changes
  useEffect(() => {
    if (selectedPoi && !isUserInteractingRef.current) {
      rotateToPoi(selectedPoi)
    }
  }, [selectedPoi, rotateToPoi])

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // 1. Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 7.5)
    cameraRef.current = camera

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45)
    scene.add(ambientLight)

    // Sun directional light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8)
    sunLight.position.set(8, 3, 6)
    scene.add(sunLight)

    // Subtle blue/purple fill light from deep space
    const fillLight = new THREE.DirectionalLight(0x3a4b68, 0.6)
    fillLight.position.set(-8, -2, -4)
    scene.add(fillLight)

    // 5. Starfield Skybox
    const starCount = 3000
    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      // Distribute in a spherical shell around space
      const radius = 60 + Math.random() * 80
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      starPositions[i * 3 + 2] = radius * Math.cos(phi)

      // Slight star color variations (warm orange, pale cyan, bright white)
      const colorType = Math.random()
      if (colorType > 0.85) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 0.6
      } else if (colorType > 0.7) {
        starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 1.0
      } else {
        starColors[i * 3] = 0.95; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 1.0
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    const starMaterial = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    })
    const starPoints = new THREE.Points(starGeometry, starMaterial)
    scene.add(starPoints)

    // 6. Mars Group (holds the planet and all surface markers)
    const marsGroup = new THREE.Group()
    scene.add(marsGroup)
    marsGroupRef.current = marsGroup

    // 7. Atmospheric Glow Mesh (Fresnel rim shader)
    const atmosphereGeometry = new THREE.SphereGeometry(MARS_RADIUS * 1.045, 64, 64)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.98, 0.42, 0.22, 1.0) * intensity * 0.9;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    })
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    scene.add(atmosphereMesh)

    // 8. Procedural Fallback Mars Sphere while GLTF loads
    const fallbackGeometry = new THREE.SphereGeometry(MARS_RADIUS, 64, 64)
    const fallbackCanvas = document.createElement('canvas')
    fallbackCanvas.width = 1024
    fallbackCanvas.height = 512
    const ctx = fallbackCanvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 512)
      grad.addColorStop(0, '#f2ece4') // North pole
      grad.addColorStop(0.12, '#be5738')
      grad.addColorStop(0.35, '#c96841')
      grad.addColorStop(0.5, '#9e462d')
      grad.addColorStop(0.7, '#ba5e39')
      grad.addColorStop(0.88, '#be5738')
      grad.addColorStop(1, '#f2ece4') // South pole
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 1024, 512)

      // Add crater spots
      ctx.fillStyle = 'rgba(70, 25, 15, 0.25)'
      for (let i = 0; i < 80; i++) {
        const cx = Math.random() * 1024
        const cy = 60 + Math.random() * 392
        const r = 4 + Math.random() * 35
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const fallbackTexture = new THREE.CanvasTexture(fallbackCanvas)
    const fallbackMaterial = new THREE.MeshStandardMaterial({
      map: fallbackTexture,
      roughness: 0.85,
      metalness: 0.05,
    })
    const fallbackMarsMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial)
    marsGroup.add(fallbackMarsMesh)

    // 9. Load the high-res 3D Mars GLTF model from public/models/mars/scene.gltf
    const loader = new GLTFLoader()
    loader.load(
      '/models/mars/scene.gltf',
      (gltf) => {
        // Remove fallback sphere
        marsGroup.remove(fallbackMarsMesh)
        fallbackGeometry.dispose()
        fallbackMaterial.dispose()

        const model = gltf.scene

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model)
        const center = new THREE.Vector3()
        box.getCenter(center)
        model.position.sub(center)

        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = (MARS_RADIUS * 2) / maxDim
        model.scale.set(scale, scale, scale)

        // Enhance material settings
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial
              mat.roughness = 0.82
              mat.metalness = 0.05
              mat.needsUpdate = true
            }
          }
        })

        marsGroup.add(model)
        setIsLoaded(true)
        setLoadProgress(100)
      },
      (xhr) => {
        if (xhr.total > 0) {
          const progress = Math.round((xhr.loaded / xhr.total) * 100)
          setLoadProgress(progress)
        }
      },
      (error) => {
        console.warn('Could not load GLTF Mars model, using procedural sphere:', error)
        setIsLoaded(true)
      }
    )

    // 10. Create 3D Interactive Pin Markers for the 20 POIs
    const markerMap = new Map<string, THREE.Group>()

    MARS_POIS.forEach((poi) => {
      const markerGroup = new THREE.Group()
      const pos = latLonToVector3(poi.lat, poi.lon, MARS_RADIUS * 1.01)
      markerGroup.position.copy(pos)

      // Orient marker along surface normal
      markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize())

      // Pin stem
      const stemGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8)
      stemGeom.translate(0, 0.09, 0)
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const stem = new THREE.Mesh(stemGeom, stemMat)
      markerGroup.add(stem)

      // Pin head sphere
      const headGeom = new THREE.SphereGeometry(0.065, 16, 16)
      headGeom.translate(0, 0.22, 0)
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xff6b35,
        emissive: 0xd9441a,
        emissiveIntensity: 0.6,
        roughness: 0.3,
      })
      const head = new THREE.Mesh(headGeom, headMat)
      head.userData = { poiId: poi.id }
      markerGroup.add(head)

      // Pulsing beacon ring
      const ringGeom = new THREE.RingGeometry(0.08, 0.13, 24)
      ringGeom.rotateX(-Math.PI / 2)
      ringGeom.translate(0, 0.01, 0)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff7a3d,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      })
      const ring = new THREE.Mesh(ringGeom, ringMat)
      markerGroup.add(ring)

      marsGroup.add(markerGroup)
      markerMap.set(poi.id, markerGroup)
    })
    markerMeshesRef.current = markerMap

    // 11. Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Handle smooth rotation towards target POI
      if (targetRotationRef.current && marsGroupRef.current) {
        const currentX = marsGroupRef.current.rotation.x
        const currentY = marsGroupRef.current.rotation.y
        const targetX = targetRotationRef.current.x
        const targetY = targetRotationRef.current.y

        // Shortest angle difference for Y
        let diffY = (targetY - currentY) % (Math.PI * 2)
        if (diffY < -Math.PI) diffY += Math.PI * 2
        if (diffY > Math.PI) diffY -= Math.PI * 2

        const diffX = targetX - currentX

        marsGroupRef.current.rotation.x += diffX * 0.08
        marsGroupRef.current.rotation.y += diffY * 0.08

        // If close enough, release target lock
        if (Math.abs(diffX) < 0.005 && Math.abs(diffY) < 0.005) {
          targetRotationRef.current = null
        }
      } else if (autoRotate && !isDraggingRef.current && marsGroupRef.current) {
        // Slow idle auto-spin
        marsGroupRef.current.rotation.y += rotationSpeed * 0.008
      }

      // Apply drag inertia
      if (!isDraggingRef.current && marsGroupRef.current && !targetRotationRef.current) {
        marsGroupRef.current.rotation.y += rotationVelocityRef.current.x
        marsGroupRef.current.rotation.x += rotationVelocityRef.current.y
        rotationVelocityRef.current.x *= 0.93
        rotationVelocityRef.current.y *= 0.93
      }

      // Animate pulsing rings on markers
      markerMap.forEach((group, poiId) => {
        const ring = group.children[2] as THREE.Mesh
        if (ring) {
          const isSelected = selectedPoi?.id === poiId
          const scale = isSelected
            ? 1.0 + Math.sin(elapsedTime * 4.5) * 0.35
            : 0.85 + Math.sin(elapsedTime * 2.5) * 0.15
          ring.scale.set(scale, scale, scale)

          const head = group.children[1] as THREE.Mesh
          if (head) {
            const headScale = isSelected ? 1.35 : 1.0
            head.scale.lerp(new THREE.Vector3(headScale, headScale, headScale), 0.1)
          }
        }
      })

      // Project active POI to 2D screen coordinates
      if (selectedPoi && cameraRef.current && onScreenPointUpdate && marsGroupRef.current) {
        const poiPos = latLonToVector3(selectedPoi.lat, selectedPoi.lon, MARS_RADIUS * 1.01)
        poiPos.applyMatrix4(marsGroupRef.current.matrixWorld)

        // Check if marker is facing the camera
        const toCamera = cameraRef.current.position.clone().sub(poiPos).normalize()
        const normal = poiPos.clone().normalize()
        const dot = normal.dot(toCamera)
        const isVisible = dot > 0.05 // On front-facing side of Mars

        poiPos.project(cameraRef.current)
        const halfWidth = width / 2
        const halfHeight = height / 2
        const screenX = poiPos.x * halfWidth + halfWidth
        const screenY = -(poiPos.y * halfHeight) + halfHeight

        onScreenPointUpdate({ x: screenX, y: screenY, isVisible })
      }

      // Slow star twinkle
      starPoints.rotation.y = elapsedTime * 0.002

      renderer.render(scene, camera)
    }

    animate()

    // 12. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove()
      }
      renderer.dispose()
    }
  }, [selectedPoi, autoRotate, rotationSpeed, onScreenPointUpdate])

  // Mouse / Touch interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractive) return
    isDraggingRef.current = true
    isUserInteractingRef.current = true
    targetRotationRef.current = null // break target lock when user drags
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY }
    rotationVelocityRef.current = { x: 0, y: 0 }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !marsGroupRef.current) return

    const deltaX = e.clientX - previousMousePositionRef.current.x
    const deltaY = e.clientY - previousMousePositionRef.current.y

    const rotSpeed = 0.005
    marsGroupRef.current.rotation.y += deltaX * rotSpeed
    marsGroupRef.current.rotation.x += deltaY * rotSpeed

    // Clamp vertical rotation so Mars does not flip upside down
    marsGroupRef.current.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, marsGroupRef.current.rotation.x))

    rotationVelocityRef.current = {
      x: deltaX * rotSpeed * 0.4,
      y: deltaY * rotSpeed * 0.4,
    }

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
    // User finished interacting after a short delay
    setTimeout(() => {
      isUserInteractingRef.current = false
    }, 1500)
  }

  // Click on pin marker or surface
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current || !marsGroupRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, cameraRef.current)

    // Check intersections with all marker head spheres
    const interactiveObjects: THREE.Object3D[] = []
    markerMeshesRef.current.forEach((group) => {
      interactiveObjects.push(group.children[1]) // the pin head sphere
    })

    const markerIntersects = raycaster.intersectObjects(interactiveObjects, false)

    if (markerIntersects.length > 0) {
      const hitPoiId = markerIntersects[0].object.userData.poiId
      const foundPoi = MARS_POIS.find((p) => p.id === hitPoiId)
      if (foundPoi) {
        onSelectPoi(foundPoi)
        rotateToPoi(foundPoi)
        return
      }
    }

    // In Singleplayer Guess Mode: user clicks on Mars surface to drop their guess pin!
    if (guessMode && onPlayerGuess) {
      const marsIntersects = raycaster.intersectObject(marsGroupRef.current, true)
      if (marsIntersects.length > 0) {
        // Convert hit point to local coordinate system of Mars
        const localHit = marsGroupRef.current.worldToLocal(marsIntersects[0].point.clone())
        const coords = vector3ToLatLon(localHit)
        onPlayerGuess(coords)
      }
    }
  }

  // Zoom with mouse scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isInteractive || !cameraRef.current) return
    const zoomDelta = e.deltaY * 0.003
    cameraRef.current.position.z = Math.max(4.2, Math.min(10.5, cameraRef.current.position.z + zoomDelta))
  }

  // Singleplayer Guess Mode: update guess marker and connecting arc line
  useEffect(() => {
    if (!marsGroupRef.current || !sceneRef.current) return

    // Clean up existing guess marker
    if (guessMarkerRef.current) {
      marsGroupRef.current.remove(guessMarkerRef.current)
      guessMarkerRef.current = null
    }

    // Clean up existing arc line
    if (arcLineRef.current) {
      marsGroupRef.current.remove(arcLineRef.current)
      arcLineRef.current = null
    }

    // Place new player guess marker
    if (playerGuessCoords) {
      const guessGroup = new THREE.Group()
      const pos = latLonToVector3(playerGuessCoords.lat, playerGuessCoords.lon, MARS_RADIUS * 1.01)
      guessGroup.position.copy(pos)
      guessGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize())

      // Cyan beacon flag for player's guess
      const stemGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8)
      stemGeom.translate(0, 0.11, 0)
      const stemMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff })
      guessGroup.add(new THREE.Mesh(stemGeom, stemMat))

      const headGeom = new THREE.SphereGeometry(0.08, 16, 16)
      headGeom.translate(0, 0.26, 0)
      const headMat = new THREE.MeshStandardMaterial({
        color: 0x00f5ff,
        emissive: 0x00a8b3,
        emissiveIntensity: 0.8,
      })
      guessGroup.add(new THREE.Mesh(headGeom, headMat))

      marsGroupRef.current.add(guessGroup)
      guessMarkerRef.current = guessGroup

      // If revealed, draw glowing arc line between guess and actual POI
      if (revealedPoi) {
        const start = latLonToVector3(playerGuessCoords.lat, playerGuessCoords.lon, MARS_RADIUS * 1.01)
        const end = latLonToVector3(revealedPoi.lat, revealedPoi.lon, MARS_RADIUS * 1.01)

        // Generate curved arc points on sphere
        const arcPoints: THREE.Vector3[] = []
        const count = 40
        for (let i = 0; i <= count; i++) {
          const t = i / count
          const p = new THREE.Vector3().lerpVectors(start, end, t).normalize()
          // Elevate arc slightly above sphere
          const elevation = Math.sin(t * Math.PI) * 0.45
          p.multiplyScalar(MARS_RADIUS * 1.01 + elevation)
          arcPoints.push(p)
        }

        const arcGeom = new THREE.BufferGeometry().setFromPoints(arcPoints)
        const arcMat = new THREE.LineBasicMaterial({
          color: 0xffd700,
          linewidth: 3,
        })
        const arcLine = new THREE.Line(arcGeom, arcMat)
        marsGroupRef.current.add(arcLine)
        arcLineRef.current = arcLine
      }
    }
  }, [playerGuessCoords, revealedPoi])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090b0e] bg-opacity-90 backdrop-blur-sm pointer-events-none transition-opacity duration-700">
          <div className="w-14 h-14 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-heading text-lg font-semibold text-white tracking-widest uppercase">
            Entering Martian Orbit
          </p>
          <div className="w-56 h-1.5 bg-neutral-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#ff6b35] transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(15, loadProgress)}%` }}
            />
          </div>
          <p className="text-xs text-neutral-400 mt-2 font-mono">{loadProgress}% assets loaded</p>
        </div>
      )}
    </div>
  )
}
