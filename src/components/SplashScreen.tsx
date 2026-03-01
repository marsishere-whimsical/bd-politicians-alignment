import { useEffect, useState } from "react"

const SplashScreen = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
    return (
      <div className="lg:hidden flex flex-col items-center justify-center text-neutral-200 p-8 text-center">
        <p className="text-2xl font-medium mb-4">
          Please view on a larger screen
        </p>
        <p className="text-xl text-neutral-500">
          (minimum width: 1024px)
        </p>
        <p className="text-lg text-neutral-500 mt-6">
          Current width: {windowWidth}px
        </p>
        <p className="text-4xl mt-8">🥪</p>
      </div>
    )
  }

  export default SplashScreen