export default function Sidebar() {
  return (
    <div className="h-full w-64 border-r border-white/10 bg-white/5">
      <div className="p-6 text-lg font-bold">Controls</div>
      <div className="px-4 py-2 text-xs uppercase tracking-wide text-white/60">Demos</div>
      <div className="px-4 py-2 flex flex-col gap-2">
        <button className="bg-white/10 hover:bg-white/20 rounded px-3 py-2 text-left">Pick and Place</button>
        <button className="bg-white/10 hover:bg-white/20 rounded px-3 py-2 text-left">Tic Tac Toe</button>
      </div>
    </div>
  )
}


