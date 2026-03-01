import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'

function About() {
  return (
    <div className="text-neutral-200 max-w-3xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">About</h1>
      <div className="space-y-6 text-left">
      <p className="text-lg leading-relaxed">
          Does what it says on the tin. But it's not just a game about putting sandwiches on an alignment chart - it's a tool for introspection. Try playing it with a friend or two and see if you really know what it means to be good or evil, lawful or chaotic.
        </p>

        <p className="text-lg leading-relaxed text-neutral-400">
          <strong>How To Use</strong>: Drag sandwiches from the carousel at the bottom onto the alignment chart.
        </p>

        <div className="pt-4 text-neutral-400">
          <p>
            Sandwich gifs are from{' '}
            <a
              href="https://rotatingsandwiches.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-neutral-300 underline"
            >
              rotatingsandwiches.com
            </a>
            . All credit goes there! Thank you so much.
          </p>
        </div>
        <div className="pt-8">
          <p className="mb-4">
            Created by{' '}
            <a
              href="https://andrew-boylan.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-neutral-300 underline"
            >
              Andrew Boylan
            </a>
          </p>

          <div className="flex space-x-4">
            <a
              href="https://www.linkedin.com/in/andrew-boylan-92842810a/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl text-neutral-200 hover:text-white transition-colors"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://github.com/eastmountaincode"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl text-neutral-200 hover:text-white transition-colors"
            >
              <FaGithub />
            </a>
            <a
              href="mailto:andreweboylan@gmail.com"
              className="text-2xl text-neutral-200 hover:text-white transition-colors"
            >
              <MdEmail />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
export default About
