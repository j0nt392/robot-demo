import { BACKEND_URL } from './config'
import './App.css'
import MotorDataPanel from './components/MotorDataPanel'
import Sidebar from './components/Sidebar'
import ReasoningPanel from './components/ReasoningPanel'
import RunControls from './components/RunControls'

function App() {

  return (
    <>
      <div className="flex h-screen w-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="text-2xl font-bold pl-12 pt-8">Tic tac toe</div>
          <div className="flex flex-col w-full h-full">
            <div className="grid grid-cols-3 h-[500px] gap-4 p-12">
              <img className="w-[640px] h-[480px]" src={`${BACKEND_URL}/video_front.mjpeg`} alt="front-cam" />
              <img className="w-[640px] h-[480px]" src={`${BACKEND_URL}/video_wrist.mjpeg`} alt="wrist-cam" />
              <div className="h-[480px]">
                <MotorDataPanel />
              </div>
            </div>
            <div className="px-12 p-12">
              <ReasoningPanel />
            </div>
            <div className="px-12 pb-12">
              <RunControls />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
